import React, { useRef } from "react";
import "./UploadFile.css";
import FileLabel from "./FileLabel";
import Button from "./Button";

function UploadFile({
  onClick,
  file,
  fileExistenceValidatorFunc,
  fileSizeValidatorFunc,
  fileFormatValidatorFunc,
}) {
  const inputFile = useRef(null);

  const onButtonClick = () => {
    inputFile.current.click();
  };

  return (
    <>
      <FileLabel
        onClick={onButtonClick}
        file={file}
        fileExistenceValidatorFunc={fileExistenceValidatorFunc}
        fileSizeValidatorFunc={fileSizeValidatorFunc}
        fileFormatValidatorFunc={fileFormatValidatorFunc}
        setFile={onClick}
      />
      <input
        type="file"
        ref={inputFile}
        id="file"
        onChange={(e) => onClick(e.target.files[0])}
        multiple={false}
        accept=".csv, .CSV"
      />
      <Button
        src="/icons/upload.svg"
        alt="Upload"
        onClick={onButtonClick}
        color="green"
        icon
      />
    </>
  );
}

export default UploadFile;
