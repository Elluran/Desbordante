/* eslint-disable*/

import React, { useState, useEffect } from "react";

import "./DependencyListFull.css";
import Dependency from "../Dependency/Dependency";
import SearchBar from "../SearchBar/SearchBar";
import Toggle from "../Toggle/Toggle";

type dependency = {
  lhs: string[];
  rhs: string;
};

type sortMethod = "Default" | "LHS" | "RHS";

interface Props {
  dependencies: dependency[];
  selectedAttributesLHS: string[];
  selectedAttributesRHS: string[];
}

const DependencyListFull: React.FC<Props> = ({
  dependencies,
  selectedAttributesLHS,
  selectedAttributesRHS,
}) => {
  const [sortedDependencies, setSortedDependencies] = useState<dependency[]>(
    []
  );
  const [chosenDependencyIndex, setChosenDependencyIndex] = useState(0);
  const [sortBy, setSortBy] = useState<sortMethod>("Default");
  const [searchString, setSearchString] = useState("");
  const allowedSortMethods: sortMethod[] = ["Default", "LHS", "RHS"];

  // update displayed dependencies on search
  useEffect(() => {
    const foundDependencies = (searchString !== ""
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

      return d1.rhs.localeCompare(d2.rhs);
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
      </div>
      <SearchBar
        defaultText="Filter dependencies"
        onChange={(str) => setSearchString(str)}
      />
      <div className="dependency-list">
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
};

export default DependencyListFull;
