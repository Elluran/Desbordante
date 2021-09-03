import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { useHistory } from "react-router-dom";

import "./FileForm.css";
import Value from "../Value/Value";
import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import Slider from "../Slider/Slider";
import UploadFile from "../UploadFile/UploadFile";
import { serverURL, submitDatasetWthParameters } from "../../APIFunctions";

/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
interface Props {
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  setUploadProgress: (n: number) => void;
  handleResponse: (res: AxiosResponse) => void;
}

const FileForm: React.FC<Props> = ({
  onSubmit,
  setUploadProgress,
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

  const history = useHistory();

  // Getting allowed field values from server
  useEffect(() => {
    axios.get(`${serverURL}/algsInfo`, { timeout: 2000 })
      .then((res) => (res.data))
      .then((data) => {
        setAllowedFileFormats(data.allowedFileFormats);

        setAllowedAlgorithms(data.allowedAlgorithms);
        setAlgorithm(data.allowedAlgorithms[0]);

        setAllowedSeparators(data.allowedSeparators);
        setSeparator(data.allowedSeparators[0]);

        setMaxFileSize(data.maxFileSize);
      })
      .catch((error) => history.push("/error"));
  }, [history]);

  // Validator functions for fields
  const fileExistenceValidator = (file: File | null) => !!file;
  const fileSizeValidator = (file: File | null) => !!file && file.size <= maxfilesize;
  const fileFormatValidator = (file: File | null) => !!file && allowedFileFormats.indexOf(file.type) !== -1;

  const separatorValidator = (sep: string) => allowedSeparators.indexOf(sep) !== -1;
  const errorValidator = (err: string) => !Number.isNaN(+err) && +err >= 0 && +err <= 1;
  const maxLHSValidator = (lhs: string) => !Number.isNaN(+lhs) && +lhs > 0 && +lhs % 1 === 0;

  // Validator function that ensures every field is correct
  function isValid() {
    return (
      fileExistenceValidator(file) &&
      fileSizeValidator(file) &&
      fileFormatValidator(file) &&
      separatorValidator(separator) &&
      errorValidator(errorThreshold) &&
      maxLHSValidator(maxLHSAttributes)
    );
  }

  return (
    <form>
      <div className="form-item">
        <h3>1.</h3>
        <UploadFile
          onClick={setFile}
          file={file}
          fileExistenceValidator={() => fileExistenceValidator(file)}
          fileSizeValidator={() => fileSizeValidator(file)}
          fileFormatValidator={() => fileFormatValidator(file)}
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
          size={2}
          inputValidator={separatorValidator}
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
          size={4}
          inputValidator={errorValidator}
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
          inputValidator={maxLHSValidator}
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
          e.preventDefault();
          onSubmit(e);
          submitDatasetWthParameters(
            file as File,
            {
              algName: algorithm,
              semicolon: separator,
              errorPercent: +errorThreshold,
              hasHeader,
              maxLHS: +maxLHSAttributes,
            },
            setUploadProgress,
            handleResponse,
          );
        }}
      >
        Analyze
      </Button>
    </form>
  );
};

export default FileForm;
