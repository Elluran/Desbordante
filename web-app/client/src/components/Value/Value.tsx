import React, { useState, useEffect } from "react";

/* eslint-disable no-unused-vars */
interface Props {
  value: string;
  onChange: (str: string) => void;
  inputValidator: (str: string) => boolean;
  size?: number;
  backgroundColorUnfocused?: string;
  backgroundColorFocused?: string;
  backgroundColorInvalid?: string;
  borderColorUnfocused?: string;
  borderColorFocused?: string;
  borderColorInvalid?: string;
  textColorUnfocused?: string;
  textColorFocused?: string;
  textColorInvalid?: string;
}
/* eslint-enable no-unused-vars */

const Value: React.FC<Props> = ({
  value,
  onChange,
  inputValidator,
  size = 5,
  backgroundColorUnfocused = "#ffffff",
  backgroundColorFocused = "#eeeeee",
  backgroundColorInvalid = "#ffdddd",
  borderColorUnfocused = "#eeeeee",
  borderColorFocused = "#dddddd",
  borderColorInvalid = "#ff5555",
  textColorUnfocused = "#aaaaaa",
  textColorFocused = "#444444",
  textColorInvalid = "#ff5555",
}) => {
  const [isValid, setIsValid] = useState(inputValidator(value));
  const [isFocused, setIsFocused] = useState(false);

  const inputHandler = (str: string) => {
    const croppedStr = str.slice(0, size);
    setIsValid(inputValidator(croppedStr));
    onChange(croppedStr);
  };

  useEffect(() => inputHandler(value), [value]);

  const styleUnfocused: React.CSSProperties = {
    backgroundColor: backgroundColorUnfocused,
    borderColor: borderColorUnfocused,
    color: textColorUnfocused,
    cursor: "pointer",
  };
  const styleFocused: React.CSSProperties = {
    backgroundColor: backgroundColorFocused,
    borderColor: borderColorFocused,
    color: textColorFocused,
    cursor: "default",
  };
  const styleInvalid: React.CSSProperties = {
    backgroundColor: backgroundColorInvalid,
    borderColor: borderColorInvalid,
    color: textColorInvalid,
    cursor: "pointer",
  };

  return (
    <input
      type="text"
      value={value}
      className="value"
      style={
        // eslint-disable-next-line no-nested-ternary
        isValid ? (isFocused ? styleFocused : styleUnfocused) : styleInvalid
      }
      size={size}
      onInput={(e) => inputHandler((e.target as HTMLTextAreaElement).value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

export default Value;
