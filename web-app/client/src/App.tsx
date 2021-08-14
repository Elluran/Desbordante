/* eslint-disable */

import React, { useState } from "react";
import "./App.css";
import Button from "./components/Button/Button";
import Toggle from "./components/Toggle/Toggle";

const App: React.FC = () => {
  const [choose, setChoose] = useState("I");
  const [set, setSet] = useState([true, true, false]);
  console.log(choose);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        fontFamily: "Roboto, sans-serif",
        fontWeight: 500,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "1rem",
        }}
      >
        Button:
        {"Oh My God Does TS Suck".split(" ").map((value, index) => (
          <Button
            key={index}
            type="button"
            size={1}
            glow="hover"
            onClick={() => console.log(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "1rem",
        }}
      >
        Radio:
        {"I died twice making these components"
          .split(" ")
          .map((value, index) => (
            <Toggle
              key={index}
              toggleCondition={() => choose === value}
              onClick={() => setChoose(value)}
              size={1}
              glow="no"
            >
              {value}
            </Toggle>
          ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "1rem",
        }}
      >
        Checkbox:
        {"Plz Send Help".split(" ").map((value, index) => (
          <Toggle
            key={index}
            toggleCondition={() => set[index]}
            onClick={() => {
              let newSet = set;
              newSet[index] = !newSet[index];
              setSet([...newSet]);
            }}
            size={1}
          >
            {value}
          </Toggle>
        ))}
      </div>
    </div>
  );
};

export default App;
