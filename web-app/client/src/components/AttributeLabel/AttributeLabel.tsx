import React from "react";
import "./AttributeLabel.css";

interface Props {
  text: string;
  labelColor: string;
  textColor?: string;
}

const AttributeLabel: React.FC<Props> = ({
  text,
  labelColor,
  textColor = "#000000",
}) => (
  <div className="attribute-label" style={{ color: textColor }}>
    <div className="circle" style={{ backgroundColor: labelColor }} />
    {text}
  </div>
);

export default AttributeLabel;
