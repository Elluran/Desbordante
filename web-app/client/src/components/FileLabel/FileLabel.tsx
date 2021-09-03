import React, { useState } from "react";
import "./FileLabel.css";
import { useDropzone } from "react-dropzone";

/* eslint-disable no-unused-vars */
interface Props {
  file: File | null;
  fileExistenceValidator: (file: File | null) => boolean;
  fileSizeValidator: (file: File | null) => boolean;
  fileFormatValidator: (file: File | null) => boolean;
  onClick: () => void;
  setFile: (file: File) => void;
}
/* eslint-enable no-unused-vars */

const FileLabel: React.FC<Props> = ({
  file,
  fileExistenceValidator,
  fileSizeValidator,
  fileFormatValidator,
  onClick,
  setFile,
}) => {
  // Is the input field glowing
  const [glow, setGlow] = useState(false);

  // Needed for dropzone
  const { getRootProps } = useDropzone({
    onDrop: (acceptedFiles) => setFile(acceptedFiles[0]),
  });

  // Make borders red if error occurs
  let borderClass = "inactive";
  if (fileExistenceValidator(file)) {
    if (fileSizeValidator(file) && fileFormatValidator(file)) {
      borderClass = "active";
    } else {
      borderClass = "error";
    }
  }

  // show error if can't process file
  let fileTitle = (
    <>
      <span className="highlight-green">Upload</span>
      {" your dataset, or "}
      <span className="highlight-purple">choose</span>
      {" one of ours ... "}
    </>
  );
  if (fileExistenceValidator(file)) {
    if (fileSizeValidator(file) && fileFormatValidator(file)) {
      fileTitle = <div>{`${file?.name.slice(0, 50)}...`}</div>;
    } else if (fileSizeValidator(file)) {
      fileTitle = (
        <span className="highlight-red">
          Error: this format is not supported
        </span>
      );
    } else {
      fileTitle = (
        <span className="highlight-red">Error: this file is too large</span>
      );
    }
  }

  return (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <div className="file-name-wrapper" {...getRootProps()}>
      <div
        className={`gradient-fill ${borderClass} glow`}
        style={{
          opacity: glow ? 1 : 0,
        }}
        onClick={onClick}
      >
        {fileTitle}
      </div>
      <div
        className={`gradient-fill outline ${borderClass}`}
        onClick={onClick}
        onMouseEnter={() => setGlow(true)}
        onMouseLeave={() => setGlow(false)}
      >
        <div className="filename">{fileTitle}</div>
      </div>
    </div>
  );
};

export default FileLabel;
