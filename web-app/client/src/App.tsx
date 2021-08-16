/* eslint-disable */

import React, { useState } from "react";
import "./App.css";
import Button from "./components/Button/Button";
import Toggle from "./components/Toggle/Toggle";
import AttributeLabel from "./components/AttributeLabel/AttributeLabel";
import Dependency from "./components/Dependency/Dependency";
import Value from "./components/Value/Value";
import Slider from "./components/Slider/Slider";

const App: React.FC = () => {
  const [choose, setChoose] = useState("I");
  const [set, setSet] = useState([true, true, false]);
  const [c, setC] = useState(0);
  const [d, setD] = useState("0.03");

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
            glow="hover"
            onClick={() => console.log(value)}
            enabled={index !== 2}
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
              toggleCondition={choose === value}
              onClick={() => setChoose(value)}
              glow="no"
              isEnabled={index !== 2}
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
            toggleCondition={set[index]}
            onClick={() => {
              let newSet = set;
              newSet[index] = !newSet[index];
              setSet([...newSet]);
            }}
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
        Other:
        <AttributeLabel text="AttributeLabel" labelColor="red" />
        <Dependency
          lhs={["mat", "meh", "luchshe"]}
          rhs="vseh"
          isActive={c === 0}
          onClick={() => setC(0)}
        />
        <Dependency
          lhs={["mat", "meh"]}
          rhs="vseh"
          isActive={c === 1}
          onClick={() => setC(1)}
        />
        <br />
        <Value
          value={d}
          onChange={(str: string) => setD(str)}
          inputValidator={(str: string) => !isNaN(+str) && !!str}
        />
        <Slider value={d} onChange={(str: string) => setD(str)} exponential />
      </div>
    </div>
  );
};

export default App;
