/* eslint-disable */
import React, { useState, useEffect } from "react";
import { AxiosResponse } from "axios";

import "./FileForm.css";
import Value from "../Value/Value";
import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import Slider from "../Slider/Slider";
import UploadFile from "../UploadFile/UploadFile";
import { getData, submitDatasetWthParameters } from "../../APIFunctions";

interface Props {
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onUploadProgress: (e: any) => void;
  setFilename: (str: string) => void;
  handleResponse: (res: AxiosResponse) => void;
}

const FileForm: React.FC<Props> = ({
  onSubmit,
  onUploadProgress,
  setFilename,
  handleResponse,
}) => {
  // Allowed field values
  const [allowedFileFormats, setAllowedFileFormats] = useState<string[]>([]);
  const [allowedSeparators, setAllowedSeparators] = useState<string[]>([]);
  const [allowedAlgorithms, setAllowedAlgorithms] = useState<string[]>([]);
  const [maxfilesize, setMaxFileSize] = useState(5e7);

  // Parameters, later sent to the server on execution as JSON
  const [file, setFile] = useState<File | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [separator, setSeparator] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [errorThreshold, setErrorThreshold] = useState<string>("0.05");
  const [maxLHSAttributes, setMaxLHSAttributes] = useState<string>("5");

  // Getting allowed field values from server
  useEffect(() => {
    getData("algsInfo").then((res) => {
      setAllowedFileFormats(res.allowedFileFormats);

      setAllowedAlgorithms(res.allowedAlgorithms);
      setAlgorithm(res.allowedAlgorithms[0]);

      setAllowedSeparators(res.allowedSeparators);
      setSeparator(res.allowedSeparators[0]);

      setMaxFileSize(res.maxFileSize);
    });
  }, []);

  useEffect(() => setFilename(file ? file.name : ""), [file]);

  // Validator functions for fields
  const fileExistenceValidatorFunc = (file: File | null) => !!file;
  const fileSizeValidatorFunc = (file: File | null) =>
    !!file && file.size <= maxfilesize;
  const fileFormatValidatorFunc = (file: File | null) =>
    !!file && allowedFileFormats.indexOf(file.type) !== -1;

  const separatorValidatorFunc = (sep: string) =>
    allowedSeparators.indexOf(sep) !== -1;
  const errorValidatorFunc = (err: string) =>
    !isNaN(+err) && +err >= 0 && +err <= 1;
  const maxLHSValidatorFunc = (lhs: string) =>
    !isNaN(+lhs) && +lhs > 0 && +lhs % 1 === 0;

  // Validator function that ensures every field is correct
  function isValid() {
    return (
      fileExistenceValidatorFunc(file) &&
      fileSizeValidatorFunc(file) &&
      fileFormatValidatorFunc(file) &&
      separatorValidatorFunc(separator) &&
      errorValidatorFunc(errorThreshold) &&
      maxLHSValidatorFunc(maxLHSAttributes)
    );
  }

  return (
    <form>
      <div className="form-item">
        <h3>1.</h3>
        <UploadFile
          onClick={setFile}
          file={file}
          fileExistenceValidatorFunc={() => fileExistenceValidatorFunc(file)}
          fileSizeValidatorFunc={() => fileSizeValidatorFunc(file)}
          fileFormatValidatorFunc={() => fileFormatValidatorFunc(file)}
        />
      </div>
      <div className="form-item">
        <h3>2. File properties</h3>

        <Toggle
          onClick={() => setHasHeader(!hasHeader)}
          toggleCondition={hasHeader}
        >
          Header
        </Toggle>
        <h3>separator</h3>
        <Value
          value={separator}
          onChange={setSeparator}
          size={1}
          inputValidator={separatorValidatorFunc}
        />
      </div>
      <div className="form-item">
        <h3>3. Algorithm</h3>
        {allowedAlgorithms.map((algo) => (
          <Toggle
            onClick={() => setAlgorithm(algo)}
            toggleCondition={algorithm === algo}
            key={algo}
          >
            {algo}
          </Toggle>
        ))}
      </div>
      <div className="form-item">
        <h3>4. Error threshold</h3>
        <Value
          value={errorThreshold}
          onChange={setErrorThreshold}
          size={3}
          inputValidator={errorValidatorFunc}
        />
        <Slider
          value={errorThreshold}
          onChange={setErrorThreshold}
          step={0.001}
          exponential
        />
      </div>
      <div className="form-item">
        <h3>5. Max LHS attributes</h3>
        <Value
          value={maxLHSAttributes}
          onChange={setMaxLHSAttributes}
          size={3}
          inputValidator={maxLHSValidatorFunc}
        />
        <Slider
          value={maxLHSAttributes}
          min={1}
          max={10}
          onChange={setMaxLHSAttributes}
          step={1}
        />
      </div>

      <Button
        type="submit"
        color="gradient"
        glow="always"
        enabled={isValid()}
        onClick={(e) => {
          onSubmit(e);
          submitDatasetWthParameters(
            file as File,
            {
              algName: algorithm,
              semicolon: separator,
              errorPercent: +errorThreshold,
              hasHeader: hasHeader,
              maxLHS: +maxLHSAttributes,
            },
            onUploadProgress,
            handleResponse
          );
        }}
      >
        Analyze
      </Button>
    </form>
  );
};

export default FileForm;
