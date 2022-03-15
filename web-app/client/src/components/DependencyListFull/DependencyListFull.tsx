/* eslint-disable*/

import React, { useState, useEffect } from "react";

import "./DependencyListFull.scss";
import Dependency from "../Dependency/Dependency";
import SearchBar from "../SearchBar/SearchBar";
import Toggle from "../Toggle/Toggle";
import Snippet from "../Snippet/Snippet";
import { attribute, dependency, coloredDepedency, coloredAttribute } from "../../types";

type sortMethod = "Default" | "LHS" | "RHS";

interface Props {
  dependencies: coloredDepedency[];
  selectedAttributesLHS: coloredAttribute[];
  selectedAttributesRHS: coloredAttribute[];
  file: File | null;
}

const DependencyListFull: React.FC<Props> = ({
  dependencies,
  selectedAttributesLHS,
  selectedAttributesRHS,
  file,
}) => {
  const [sortedDependencies, setSortedDependencies] = useState<dependency[]>(
    []
  );
  const [chosenDependencyIndex, setChosenDependencyIndex] = useState(-1);
  const [sortBy, setSortBy] = useState<sortMethod>("Default");
  const [searchString, setSearchString] = useState("");
  const allowedSortMethods: sortMethod[] = ["Default", "LHS", "RHS"];
  const [selectedDependency, setSelectedDependency] = useState<coloredDepedency>();



  // update displayed dependencies on search
  useEffect(() => {
    const foundDependencies = (searchString !== ""
      ? dependencies.filter((dep) =>
          searchString
            .split(" ")
            .filter((str) => str)
            .every(
              (elem) =>
                dep.lhs.map((attr) => attr.name).includes(elem) ||
                dep.rhs.name === elem
            )
        )
      : [...dependencies]
    )
      // filter by chosen LHS
      .filter((dep) =>
        selectedAttributesLHS.length > 0
          ? selectedAttributesLHS.some((attr) => dep.lhs.includes(attr))
          : true
      )
      // filter by chosen RHS
      .filter((dep) =>
        selectedAttributesRHS.length > 0
          ? selectedAttributesRHS.some((attr) => dep.rhs === attr)
          : true
      );

    // sort found dependencies
    const newSortedDependencies = foundDependencies.sort((d1, d2) => {
      if (sortBy === "Default") {
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

      return d1.rhs.name.localeCompare(d2.rhs.name);
    });

    setSortedDependencies(newSortedDependencies);
  }, [
    dependencies,
    selectedAttributesLHS,
    selectedAttributesRHS,
    searchString,
    sortBy,
  ]);

  return (
    <div className="dependency-list-full">
      <h1 className="title">Dependencies</h1>
      <div className="sort">
        <h3>Sort by</h3>
        {allowedSortMethods.map((value, index) => (
          <Toggle
            onClick={() => setSortBy(value)}
            toggleCondition={sortBy === value}
            color="0"
            key={index}
          >
            {value}
          </Toggle>
        ))}
        <SearchBar
          defaultText="Filter dependencies"
          onChange={(str) => setSearchString(str)}
        />
      </div>
      <div className="dependency-list-wrapper">
        <div className="dependency-list">
          {sortedDependencies.map((dep, index) => {
            return (
              <Dependency
                dep={dep}
                key={index}
                onClick={() => {
                  setChosenDependencyIndex(index)
                  setSelectedDependency(dep)
                }}
                isActive={index == chosenDependencyIndex}
              />
            )
          })}
        </div>
        <div className="snippet">
          <Snippet file={file} selectedDependency={selectedDependency} />
        </div>
      </div>
    </div>
  );
};

export default DependencyListFull;
