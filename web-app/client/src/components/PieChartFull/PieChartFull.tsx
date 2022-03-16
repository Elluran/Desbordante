import React, { useState, useEffect } from "react";

import "./PieChartFull.scss";
import SearchBar from "../SearchBar/SearchBar";
import Chart from "./Chart";
import Button from "../Button/Button";
import { attribute } from "../../types";

/* eslint-disable no-unused-vars */
interface Props {
  title: string;
  attributes: attribute[];
  maxItemsShown?: number;
  maxItemsSelected?: number;
  selectedAttributes: attribute[];
  setSelectedAttributes: (arr: attribute[]) => void;
}
/* eslint-enable no-unused-vars */

const PieChartFull: React.FC<Props> = ({
  title,
  attributes,
  maxItemsShown = 9,
  maxItemsSelected = 9,
  selectedAttributes = [],
  setSelectedAttributes,
}) => {
  const [searchString, setSearchString] = useState("");
  const [foundAttributes, setFoundAttributes] = useState<attribute[]>([]);
  const [depth, setDepth] = useState(0);
  const [displayAttributes, setDisplayAttributes] = useState<attribute[]>([]);

  // Update found attributes if search string changes or attributes change.
  // Keep found attributes sorted.
  useEffect(() => {
    const newFoundAttributes = searchString
      ? attributes.filter((attr) => attr.name.includes(searchString))
      : attributes;

    setFoundAttributes(
      newFoundAttributes
        .filter((attr) => !selectedAttributes.includes(attr))
        /* eslint-disable-next-line comma-dangle */
        .sort((a, b) => b.value - a.value)
    );
  }, [attributes, searchString, selectedAttributes]);

  // Set DisplayAttributes to top-{maxItemsShown} of found attributes.
  // Add the "Other" value, if needed.
  useEffect(() => {
    const newDisplayAttributes = foundAttributes.slice(
      maxItemsShown * depth,
      /* eslint-disable-next-line comma-dangle */
      maxItemsShown * (depth + 1)
    );

    let newOtherValue = 0;
    foundAttributes.slice(maxItemsShown * (depth + 1)).forEach((attr) => {
      newOtherValue += attr.value;
    });

    if (foundAttributes.length > maxItemsShown * (depth + 1)) {
      newDisplayAttributes.push({
        name: "Other",
        value: newOtherValue,
      });
    }

    setDisplayAttributes(newDisplayAttributes);
  }, [foundAttributes, depth, maxItemsShown]);

  return (
    <div className="pie-chart-full d-flex flex-column align-items-center">
      <h1 className="title fw-bold mb-3">{title}</h1>
      <div className="d-flex align-items-center">
        <SearchBar
          defaultText="Filter attributes..."
          onChange={setSearchString}
          className="mx-2"
        />
        <Button
          variant="dark"
          onClick={() => setDepth(depth - 1)}
          enabled={depth > 0}
          className="mx-2"
        >
          <img src="/icons/up-depth.svg" alt="Up" />
        </Button>
      </div>
      <Chart
        onSelect={(_, item) => {
          if (item.length > 0) {
            if (item[0].index === maxItemsShown) {
              setDepth(depth + 1);
            } else {
              setSelectedAttributes(
                selectedAttributes
                  .concat(item.length ? [displayAttributes[item[0].index]] : [])
                  /* eslint-disable-next-line comma-dangle */
                  .slice(0, maxItemsSelected)
              );
            }
          }
        }}
        displayAttributes={displayAttributes}
        selectedAttributes={selectedAttributes}
        setSelectedAttributes={setSelectedAttributes}
      />
    </div>
  );
};

export default PieChartFull;
