/* eslint-disable*/

import React, { useState, useEffect } from "react";

import "./DependencyListFull.css";
import RadioLight from "./RadioLight";
import Dependency from "./Dependency";
import SearchBar from "./SearchBar";

function DependencyScreen({ dependencies, attributes }) {
  const [sortedDependencies, setSortedDependencies] = useState([]);
  const [chosenDependencyIndex, setChosenDependencyIndex] = useState(0);
  const [sortBy, setSortBy] = useState("None");
  const [searchString, setSearchString] = useState("");

  // useEffect(() => setSearchString(""), []);

  useEffect(() => {
    const foundDependencies =
      searchString !== ""
        ? dependencies.filter((dep) =>
            searchString
              .split(" ")
              .filter((str) => str)
              .every((elem) =>
                dep.lhs
                  .concat(dep.rhs)
                  .join("")
                  .includes(elem)
              )
          )
        : [...dependencies];

    const newSortedDependencies = foundDependencies.sort((d1, d2) => {
      if (sortBy === "None") {
        if (d1.lhs.length !== d2.lhs.length) {
          return d1.lhs.length - d2.lhs.length;
        }
        return (d1.lhs.join("") + d1.rhs).localeCompare(
          d2.lhs.join("") + d2.rhs
        );
      }

      if (sortBy === "LHS") {
        return (d1.lhs.join("") + d1.rhs).localeCompare(
          d2.lhs.join("") + d2.rhs
        );
      }

      if (sortBy === "RHS") {
        return d1.rhs.localeCompare(d2.rhs);
      }
    });

    setSortedDependencies(newSortedDependencies);
    console.log(dependencies);
    console.log(sortedDependencies);
    console.log(sortBy);
    console.log(searchString);
    console.log(searchString.split(" ").filter((str) => str));
  }, [dependencies, searchString, sortBy]);

  // useEffect(() => {
  //   setSortedDependencies(
  //     foundDependencies.sort((d1, d2) => {
  //       if (sortBy === "None") {
  //         if (d1.lhs.length !== d2.lhs.length) {
  //           return d1.lhs.length - d2.lhs.length;
  //         }
  //         return (d1.lhs.join("") + d1.rhs).localeCompare(
  //           d2.lhs.join("") + d2.rhs
  //         );
  //       }

  //       if (sortBy === "LHS") {
  //         return (d1.lhs.join("") + d1.rhs).localeCompare(
  //           d2.lhs.join("") + d2.rhs
  //         );
  //       }

  //       if (sortBy === "RHS") {
  //         return d1.rhs.localeCompare(d2.rhs);
  //       }
  //     })
  //   );
  // }, [foundDependencies, sortBy]);

  return (
    <div className="dependency-list-full">
      <h1 className="title">Dependencies</h1>
      <div className="sort">
        <h3>Sort by</h3>
        {["None", "LHS", "RHS"].map((value, index) => (
          <RadioLight
            text={value}
            onClick={() => setSortBy(value)}
            toggleObj={sortBy}
            key={index}
          />
        ))}
      </div>
      <SearchBar
        defaultText="Filter dependencies"
        setSearchString={setSearchString}
      />
      <div className="dependency-list">
        {/* <ScrollFade /> */}
        {sortedDependencies.map((dep, index) => (
          <Dependency
            lhs={dep.lhs}
            rhs={dep.rhs}
            key={index}
            onClick={() => setChosenDependencyIndex(index)}
            isActive={index == chosenDependencyIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default DependencyScreen;