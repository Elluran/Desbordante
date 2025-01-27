import React, { useContext } from "react";
import { sentenceCase } from "change-case";

import { isBuiltinDataset } from "../../types/dataset";
import { fileFormatList } from "../../types/fileProps";

import { AlgorithmConfigContext } from "../AlgorithmConfigContext";
import { FileFormContext } from "../FileFormContext";
import FormItem from "../FormItem/FormItem";
import Toggle from "../Toggle/Toggle";
import Value from "../Value/Value";
import Selector from "../Selector/Selector";
import { InputFileFormat, PrimitiveType } from "../../types/globalTypes";

const ChooseFileProps = () => {
  const { fileProps, setFileProps, primitiveType, dataset } =
    useContext(FileFormContext)!;

  const { validators } = useContext(AlgorithmConfigContext)!;

  const changeDelimiter = (newDelimiter: string) => {
    setFileProps((prevProps) => ({
      ...prevProps,
      delimiter: newDelimiter,
    }));
  };

  const toggleHeader = () => {
    setFileProps((prevProps) => ({
      ...prevProps,
      hasHeader: !prevProps.hasHeader,
    }));
  };

  const changeFileFormat = (newFormat: InputFileFormat) => {
    setFileProps((prevProps) => ({
      ...prevProps,
      fileFormat: newFormat,
    }));
  };

  const toggleTransactionId = () => {
    setFileProps((prevProps) => ({
      ...prevProps,
      hasTransactionId: !prevProps.hasTransactionId,
    }));
  };

  const changeTransactionIdColumn = (newColumn: string) => {
    setFileProps((prevProps) => ({
      ...prevProps,
      transactionIdColumn: newColumn,
    }));
  };

  const changeItemSetColumn = (newColumn: string) => {
    setFileProps((prevProps) => ({
      ...prevProps,
      itemSetColumn: newColumn,
    }));
  };

  return (
    <>
      <FormItem enabled={!isBuiltinDataset(dataset)}>
        <h5 className="text-white mb-0 mx-2">Delimiter:</h5>
        <Value
          value={fileProps.delimiter}
          onChange={changeDelimiter}
          size={2}
          inputValidator={validators.isValidSeparator}
          className="mx-2"
        />
        <h5 className="text-white mb-0 mx-2">Has header row:</h5>
        <Toggle
          onClick={toggleHeader}
          toggleCondition={fileProps.hasHeader}
          className="mx-2"
        >
          {fileProps.hasHeader ? "Yes" : "No"}
        </Toggle>
      </FormItem>
      {primitiveType === PrimitiveType.AR && (
        <FormItem enabled={!isBuiltinDataset(dataset)}>
          <h5 className="text-white mb-0 mx-2">File format:</h5>
          <Selector
            options={[...fileFormatList]}
            current={fileProps.fileFormat}
            onSelect={changeFileFormat}
            label={sentenceCase}
            className="mx-2"
          />
        </FormItem>
      )}
      {primitiveType === PrimitiveType.AR && (
        <>
          <FormItem
            enabled={
              !isBuiltinDataset(dataset) &&
              fileProps.fileFormat === InputFileFormat.SINGULAR
            }
          >
            <h5 className="text-white mb-0 mx-2">ID column:</h5>
            <Value
              inputValidator={validators.isInteger}
              value={fileProps.transactionIdColumn}
              onChange={changeTransactionIdColumn}
              className="mx-2"
            />
            <h5 className="text-white mb-0 mx-2">Itemset column:</h5>
            <Value
              inputValidator={validators.isInteger}
              value={fileProps.itemSetColumn}
              onChange={changeItemSetColumn}
              className="mx-2"
            />
          </FormItem>
          <FormItem enabled={fileProps.fileFormat === InputFileFormat.TABULAR && !isBuiltinDataset(dataset)}>
            <h5 className="text-white mb-0 mx-2">Has transaction ID:</h5>
            <Toggle
              onClick={toggleTransactionId}
              toggleCondition={fileProps.hasTransactionId}
              className="mx-2"
            >
              {fileProps.hasTransactionId ? "Yes" : "No"}
            </Toggle>
          </FormItem>
        </>
      )}
    </>
  );
};

export default ChooseFileProps;
