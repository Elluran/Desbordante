/* eslint-disable */

import React, { useState, useEffect } from "react";
// import "./Toggle.css";

interface Props {
  toggleCondition: () => boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  colorInactive?: string[];
  colorActive?: string[];
  outlineInactive?: string;
  outlineWidth?: number;
  textColorInactive?: string;
  textColorActive?: string;
  size?: number;
  glow?: "no" | "toggle";
  glowRadius?: number;
}

const Toggle: React.FC<Props> = ({
  toggleCondition,
  onClick,
  colorInactive = ["#00000000"],
  colorActive = ["red", "blue"],
  outlineInactive = "#000000",
  outlineWidth = 0.1,
  textColorInactive = "#000000",
  textColorActive = "#ffffff",
  size = 1.4,
  glow = "toggle",
  glowRadius = 0.4,
  children,
}) => {
  const [hover, setHover] = useState(false);
  const [isToggled, setIsToggled] = useState(toggleCondition());

  useEffect(() => {
    setIsToggled(toggleCondition());
  }, [toggleCondition]);

  const styleInactive: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    height: `${size}rem`,
    background:
      colorInactive.length === 1
        ? colorInactive[0]
        : `linear-gradient(45deg, ${colorInactive.join(", ")})`,
    padding: `${size}rem`,
    backfaceVisibility: "hidden",
    transform: `scale(${hover ? 1.03 : 1})`,
    cursor: hover ? "pointer" : "default",
    outline: `${outlineWidth}rem solid ${outlineInactive}`,
    color: textColorInactive,
  };

  const styleActive: React.CSSProperties = {
    ...styleInactive,
    background:
      colorActive.length === 1
        ? colorActive[0]
        : `linear-gradient(45deg, ${colorActive.join(", ")})`,
    outline: "none",
    color: textColorActive,
  };

  const toggle = (
    <button
      type="button"
      style={isToggled ? styleActive : styleInactive}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const toggleGlow = (
    <div
      style={{
        ...(isToggled ? styleActive : styleInactive),
        content: "",
        position: "absolute",
        zIndex: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        filter: `blur(${isToggled ? glowRadius : 0}rem)`,
      }}
    />
  );

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="toggle-container"
    >
      {glow !== "no" && toggleGlow}
      {toggle}
    </div>
  );
};

export default Toggle;
