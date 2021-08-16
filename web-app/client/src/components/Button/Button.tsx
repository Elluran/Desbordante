import React, { useState, useEffect } from "react";

interface Props {
  type: "button" | "submit";
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  enabled?: boolean;
  color?: string[];
  textColor?: string;
  glow?: "no" | "hover" | "always";
  glowRadius?: number;
}

const Button: React.FC<Props> = ({
  type,
  onClick,
  enabled = true,
  color = ["red", "blue"],
  textColor = "#ffffff",
  glow = "hover",
  glowRadius = 0.4,
  children,
}) => {
  const [hover, setHover] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  // determine if button should be glowing
  useEffect(() => {
    if (glow === "hover") {
      if (hover) {
        setIsGlowing(true);
      } else {
        setIsGlowing(false);
      }
    } else {
      setIsGlowing(true);
    }
  }, [hover, glow]);

  // dynamic style for button
  const style: React.CSSProperties = {
    background:
      color.length === 1
        ? color[0]
        : `linear-gradient(45deg, ${color.join(", ")})`,
    backfaceVisibility: "hidden",
    cursor: hover && enabled ? "pointer" : "default",
    filter: `brightness(${enabled ? 100 : 50}%)`,
    transform: `scale(${hover && enabled ? 1.03 : 1})`,
    color: textColor,
  };

  // button user sees and clicks
  const button = (
    <button type={type} style={style} onClick={enabled ? onClick : () => {}}>
      {children}
    </button>
  );

  // button used for glow. rendered behind
  const buttonGlow = (
    <div
      style={{
        ...style,
        content: "",
        position: "absolute",
        zIndex: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        filter: `blur(${isGlowing ? glowRadius : 0}rem)`,
      }}
    />
  );

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="button-container"
    >
      {glow !== "no" && enabled && buttonGlow}
      {button}
    </div>
  );
};

export default Button;
