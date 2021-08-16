import React from "react";
import "./Dependency.css";

interface Props {
  lhs: string[];
  rhs: string;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

const Dependency: React.FC<Props> = ({
  lhs = [],
  rhs = "",
  isActive,
  onClick,
}) => (
  <div className="dependency" role="button" tabIndex={0} onClick={onClick}>
    {lhs.map((attr) => (
      <div className={`attribute-name ${isActive && "active"}`} key={attr}>
        {attr}
      </div>
    ))}

    <svg
      className={`arrow ${isActive ? "active" : ""}`}
      viewBox="0 0 58.73 20.09"
    >
      <line x1="48.68" y1="0.5" x2="58.23" y2="10.05" />
      <line x1="58.23" y1="10.05" x2="48.68" y2="19.59" />
      <line x1="58.23" y1="10.05" x2="0.5" y2="10.05" />
    </svg>

    <div className={`attribute-name ${isActive ? "active" : ""}`}>{rhs}</div>
  </div>
);

export default Dependency;
