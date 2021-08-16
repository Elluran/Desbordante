import React, { useEffect } from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import "./LoadingScreen.css";

interface Props {
  onComplete: () => void;
  progress: number;
}

const LoadingScreen: React.FC<Props> = ({ onComplete, progress }) => {
  useEffect(() => {
    if (progress >= 1) {
      onComplete();
    }
  }, [progress, onComplete]);

  return (
    <div className="message-and-bar">
      <h1>Uploading your file. Please, wait.</h1>
      <ProgressBar maxWidth={50} progress={progress} thickness={0.8} rounded />
    </div>
  );
};

export default LoadingScreen;
