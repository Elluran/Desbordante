import React, { useRef } from "react";
import "./UploadFile.css";
import FileLabel from "../FileLabel/FileLabel";
import Button from "../Button/Button";

/* eslint-disable no-unused-vars */
interface Props {
  file: File | null;
  onClick: (file: File) => void;
  fileExistenceValidatorFunc: (file: File | null) => boolean;
  fileSizeValidatorFunc: (file: File | null) => boolean;
  fileFormatValidatorFunc: (file: File | null) => boolean;
}
/* eslint-enable no-unused-vars */

const UploadFile: React.FC<Props> = ({
  file,
  onClick,
  fileExistenceValidatorFunc,
  fileSizeValidatorFunc,
  fileFormatValidatorFunc,
}) => {
  // you can only use <input type="file" /> for choosing files,
  // so the reference is used to forward click action
  // from regular button to hidden input file
  const inputFile = useRef<HTMLInputElement>(null);

  return (
    <>
      <FileLabel
        file={file}
        onClick={() => inputFile?.current?.click()}
        fileExistenceValidatorFunc={fileExistenceValidatorFunc}
        fileSizeValidatorFunc={fileSizeValidatorFunc}
        fileFormatValidatorFunc={fileFormatValidatorFunc}
        setFile={onClick}
      />
      <input
        type="file"
        ref={inputFile}
        onChange={(e) => {
          if (e.target.files) {
            onClick(e.target.files[0]);
          }
        }}
        multiple={false}
        accept=".csv, .CSV"
      />
      <Button
        onClick={() => inputFile?.current?.click()}
        color="0"
        type="button"
      >
        <img src="/icons/upload.svg" alt="upload" />
      </Button>
    </>
  );
};

export default UploadFile;
