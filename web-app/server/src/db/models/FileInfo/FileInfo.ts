import { Row } from "@fast-csv/parse";
import { ApolloError, UserInputError } from "apollo-server-core";
import { CsvParserStream, parse } from "fast-csv";
import fs from "fs";
import path from "path";
import { BOOLEAN, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, HasMany, HasOne, IsUUID, Model, Table } from "sequelize-typescript";
import { finished } from "stream/promises";
import { generateHeaderByPath } from "../../../graphql/schema/TaskCreating/generateHeader";
import { FileProps } from "../../../graphql/types/types";
import { BaseTaskConfig } from "../TaskData/TaskConfig";
import { User } from "../UserInfo/User";
import { FileFormat } from "./FileFormat";
import {
    SingularFileFormatProps,
    TabularFileFormatProps, createTabularFileFromSingular, findRowsAndColumnsNumber,
} from "../../../graphql/schema/TaskCreating/csvValidator";
import { BuiltInDatasetInfoType, getPathToBuiltInDataset } from "../../initBuiltInDatasets";
import validator from "validator";
import isUUID = validator.isUUID;

interface FileInfoModelMethods {
    getColumnNames: () => string[];
}

@Table({
    paranoid: true,
    updatedAt: false,
    createdAt: false,
    tableName: "FilesInfo",
})
export class FileInfo extends Model implements FileInfoModelMethods {
    @IsUUID(4)
    @Column({
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
    })
    fileID!: string;

    @ForeignKey(() => User)
    @Column({ type: UUID, allowNull: true })
    userID!: string | null;

    @BelongsTo(() => User)
    user!: User | null;

    @HasMany(() => BaseTaskConfig)
    baseConfigs?: [BaseTaskConfig];

    @HasOne(() => FileFormat)
    fileFormat?: FileFormat;

    @Column({ type: BOOLEAN, defaultValue: false, allowNull: false })
    isBuiltIn!: boolean;

    @Column({ type: STRING, allowNull: true })
    mimeType!: string | null;

    @Column({ type: STRING })
    encoding!: string | null;

    @Column({ type: TEXT, allowNull: true })
    fileName!: string;

    @Column({ type: TEXT, allowNull: false })
    originalFileName!: string;

    @Column({ type: BOOLEAN, allowNull: false })
    hasHeader!: boolean;

    @Column({ type: STRING, allowNull: false })
    delimiter!: string;

    @Column({ type: TEXT })
    renamedHeader!: string;

    @Column({ type: INTEGER, allowNull: true })
    rowsCount!: number;

    @Column({ type: INTEGER, allowNull: true })
    countOfColumns: number;

    @Column({ type: STRING, unique: true })
    path!: string;

    static getPathToUploadedDataset = (fileName: string) => {
        if (!require.main) {
            throw Error("FATAL SERVER ERROR");
        }
        const rootPath = path.dirname(require.main.filename).split("/");
        rootPath.pop();
        rootPath.pop(); // remove folder 'bin'
        rootPath.push("uploads"); // add folder 'uploads'
        rootPath.push(fileName); // add file '${fileID}.csv'
        return rootPath.join("/");
    };

    generateHeader = async () => {
        const file = await FileInfo.findByPk(this.fileID);
        if (!file) {
            throw new ApolloError("File not found");
        }
        const { path, hasHeader, delimiter } = file;
        return await generateHeaderByPath(path, hasHeader, delimiter);
    };

    getColumnNames = () => JSON.parse(this.renamedHeader) as string[];

    static getColumnNamesForFile = async (fileID: string) => {
        if (!isUUID(fileID, 4)) {
            throw new ApolloError("Incorrect fileID");
        }
        const file = await FileInfo.findByPk(fileID, { attributes: ["renamedHeader"] });
        if (!file) {
            throw new ApolloError("File not found");
        }
        return file.getColumnNames();
    };

    static saveBuiltInDataset = async (props: BuiltInDatasetInfoType) => {
        const { fileName, datasetProps } = props;
        const withFileFormat = props.datasetProps.inputFormat != null;

        const path = getPathToBuiltInDataset(props.fileName);
        const { hasHeader, delimiter } = datasetProps;
        const header = await generateHeaderByPath(path, hasHeader, delimiter);
        const renamedHeader = JSON.stringify(header);

        const [file, created] = await FileInfo.findOrCreate({
            where: { path },
            defaults: {
                fileName, originalFileName: fileName, renamedHeader,
                isBuiltIn: true, hasHeader, delimiter,
            },
        });
        if (created) {
            console.log(`Built in dataset ${fileName} was created`);
        } else {
            console.log(`Built in dataset ${fileName} already exists`);
            return file;
        }
        const counters = await findRowsAndColumnsNumber(path, delimiter);
        await file.update(counters);

        if (withFileFormat) {
            await FileFormat.createFileFormatIfPropsValid(file, datasetProps);
        }
        return file;
    };

    static uploadDataset = async (datasetProps: FileProps, table: any, userID: string | null = null, withFileFormat = false) => {
        const { createReadStream, filename: originalFileName, mimetype: mimeType, encoding } = await table;

        const stream = createReadStream();
        const file = await FileInfo.create(
            { ...datasetProps, encoding, mimeType, originalFileName, userID });

        const { fileID } = file;
        const fileName = `${fileID}.csv`;

        const path = FileInfo.getPathToUploadedDataset(fileName);

        await file.update({ fileName, path });

        const out = fs.createWriteStream(`uploads/${fileName}`);
        stream.pipe(out);
        await finished(out);

        await file.update({ renamedHeader: JSON.stringify(await file.generateHeader()) });

        if (withFileFormat) {
            if (!datasetProps.inputFormat) {
                throw new ApolloError("File hasn't input format");
            }
            const fileFormat = await FileFormat.createFileFormatIfPropsValid(file, datasetProps);
            let specificFileFormat = datasetProps.inputFormat! === "SINGULAR" ?
                { inputFormat: "SINGULAR", tidColumnIndex: datasetProps.tidColumnIndex,
                    itemColumnIndex: datasetProps.itemColumnIndex } as SingularFileFormatProps
                : { inputFormat: "TABULAR", hasTid: datasetProps.hasTid } as TabularFileFormatProps;

            // Find rows count before creating new file
            let counters = await findRowsAndColumnsNumber(
                path, datasetProps.delimiter, specificFileFormat
            );
            await file.update(counters);

            if (datasetProps.inputFormat === "SINGULAR") {
                const newPath = await createTabularFileFromSingular(path, datasetProps.delimiter,
                    datasetProps.tidColumnIndex!, datasetProps.itemColumnIndex!);

                // Find rows count after creating file
                specificFileFormat = { inputFormat: "TABULAR", hasTid: true } as TabularFileFormatProps;
                await fileFormat.update({ inputFormat: "TABULAR", hasTid: true });
                counters = await findRowsAndColumnsNumber(newPath, datasetProps.delimiter, specificFileFormat);
                await file.update({ path: newPath, ...counters, hasHeader: false });
            }
        } else {
            const counters = await findRowsAndColumnsNumber(
                path, datasetProps.delimiter
            );
            await file.update(counters);
        }
        return file;
    };

    static GetRowsByIndices = async (datasetPath: fs.PathLike, delimiter: string, indices: number[], hasHeader: boolean) => {
        const sortedIndices = indices.sort((a, b) => a - b);
        const rows = new Map<number, string[]>();
        let curRowNum = sortedIndices[0];

        return new Promise(resolve => {
            const parser: CsvParserStream<Row, Row> = parse({
                delimiter,
                skipRows: curRowNum + Number(hasHeader),
                maxRows: sortedIndices[sortedIndices.length - 1] - curRowNum + 1,
            });

            fs.createReadStream(datasetPath)
                .pipe(parser)
                .on("error", (e) => {
                    throw new ApolloError(`ERROR WHILE READING FILE:\n\r${e.message}`);
                })
                .on("data", (row) => {
                    if (sortedIndices.includes(curRowNum++)) {
                        rows.set(curRowNum - 1, row);
                    }
                })
                .on("end", () => {
                    resolve(rows);
                });
        });
    };
}
