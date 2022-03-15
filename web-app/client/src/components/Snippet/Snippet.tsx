/* eslint-disable no-console */
import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { coloredDepedency } from "../../types";
import { DelimeterContext } from "../DelimeterContext/DelimeterContext";
import "./Snippet.scss";

import { serverURL } from "../../APIFunctions";

interface Props {
  file: File | null;
  taskId: string;
  selectedDependency: coloredDepedency | undefined;
}

/* eslint-disable prefer-template */
/* eslint-disable no-cond-assign */
/* eslint-disable prefer-destructuring */

const MAX_LENGTH = 100;
const DISTANCE_BETWEEN_CELLS = 1;

// eslint-disable-next-line max-len
function getSelectedIndices(
  dep: coloredDepedency | undefined,
  header: string[]
): Map<number, string> {
  const selectedIndices = new Map<number, string>();
  if (dep === undefined) {
    return selectedIndices;
  }
  dep.lhs.forEach((lhs) =>
    selectedIndices.set(header.indexOf(lhs.name), lhs.color)
  );
  selectedIndices.set(header.indexOf(dep.rhs.name), dep.rhs.color);
  return selectedIndices;
}

// function convertCSVToArray(inputData: string, delimiter: string) {
//   const objPattern = new RegExp(
//     "(\\" +
//       delimiter +
//       "|\\r?\\n|\\r|^)" +
//       '(?:"([^"]*(?:""[^"]*)*)"|' +
//       '([^"\\' +
//       delimiter +
//       "\\r\\n]*))",
//     "gi"
//   );

//   let arrMatches: any;
//   const arrData: string[][] = [[]];
//   arrMatches = objPattern.exec(inputData);
//   while (arrMatches !== null) {
//     const strMatchedDelimiter = arrMatches[1];
//     if (strMatchedDelimiter.length && strMatchedDelimiter !== delimiter) {
//       arrData.push([]);
//     }

//     let strMatchedValue;

//     if (arrMatches[2]) {
//       strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
//     } else {
//       strMatchedValue = arrMatches[3];
//     }

//     arrData[arrData.length - 1].push(strMatchedValue);
//     arrMatches = objPattern.exec(inputData);
//   }

//   return arrData;
// }

const Snippet: React.FC<Props> = ({ file, taskId, selectedDependency }) => {
  const [table, setTable] = useState<string[][]>([[]]);
  const selectedIndices: Map<number, string> = getSelectedIndices(
    selectedDependency,
    table[0]
  );
  const delimeterContext = useContext(DelimeterContext);

  // useEffect(() => {
  //   function readFile() {
  //     file!
  //       .text()
  //       .then((buffer) =>
  //         setTable(convertCSVToArray(buffer, delimeterContext?.delimeter!))
  //       );
  //   }

  //   if (file !== null) {
  //     readFile();
  //   }
  // });

  useEffect(() => {
    axios
      .get(serverURL + "/getSnippet?taskID=" + taskId)
      .then((res) => setTable(res.data.arrData));
  }, []);

  return (
    <table>
      {table === undefined ? (
        <></>
      ) : (
        table
          .filter((val, idx) => idx < MAX_LENGTH)
          .map((value, index) => (
            <tr
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            >
              {value
                .filter((cell, idx) => idx !== value.length - 1 || cell !== "")
                .map((cell, idx) => (
                  <td
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    style={
                      selectedIndices.get(idx) !== undefined
                        ? { backgroundColor: selectedIndices.get(idx) }
                        : { backgroundColor: "#ffffff" }
                    }
                  >
                    {cell}
                  </td>
                ))}
            </tr>
          ))
      )}
    </table>
  );
};

export default Snippet;
