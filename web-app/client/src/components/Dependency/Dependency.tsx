import React, { useState } from "react";

interface Props {
  lhs: string[];
  rhs: string;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  colorInactive?: string;
  colorActive?: string;
  textColorInactive?: string;
  textColorActive?: string;
}

const Dependency: React.FC<Props> = ({
  lhs = [],
  rhs = "",
  isActive,
  onClick,
  colorInactive = "#aaaaaa",
  colorActive = "blue",
  textColorInactive = "#000000",
  textColorActive = "#ffffff",
}) => {
  const [hover, setHover] = useState(false);

  const style: React.CSSProperties = {
    backgroundColor: isActive ? colorActive : colorInactive,
    color: isActive ? textColorActive : textColorInactive,
    cursor: isActive ? "default" : "pointer",
  };

  return (
    <div
      className="dependency"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ transform: `translateX(${hover ? 1 : 0}rem)` }}
    >
      {lhs.map((attr) => (
        <div className="attribute-name" key={attr} style={style}>
          {attr}
        </div>
      ))}

      {/* arrow */}
      <svg
        className="arrow"
        viewBox="0 0 58.73 20.09"
        style={{ stroke: isActive ? colorActive : colorInactive }}
      >
        <line x1="48.68" y1="0.5" x2="58.23" y2="10.05" />
        <line x1="58.23" y1="10.05" x2="48.68" y2="19.59" />
        <line x1="58.23" y1="10.05" x2="0.5" y2="10.05" />
      </svg>

      <div className="attribute-name" style={style}>
        {rhs}
      </div>
    </div>
  );
};

export default Dependency;
