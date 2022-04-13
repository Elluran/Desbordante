import React, { useCallback, useContext, useState } from "react";
import styled from "styled-components";
import { Container } from "react-bootstrap";

import { getClustersPreview_taskInfo_data_result_TypoClusterTaskResult_TypoClusters } from "../../../graphql/operations/queries/EDP/__generated__/getClustersPreview";
import stringToColor from "../../../functions/stringToColor";
import { TaskContext } from "../../TaskContext";
import { FunctionalDependency } from "../../../types/taskInfo";
import colors from "../../../colors";
import Toggle from "../../Toggle/Toggle";

const TableHeader = styled.thead`
  tr {
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      z-index: 1;
    }

    &:first-of-type {
      th:first-of-type {
        border-top-left-radius: 2rem;
      }

      th:last-of-type {
        border-top-right-radius: 2rem;
      }
    }
  }
`;

const TableBody = styled.tbody`
  //tr {
  //  &:last-of-type {
  //    td:first-of-type {
  //      border-bottom-left-radius: 0.4rem;
  //    }
  //
  //    td:last-of-type {
  //      border-bottom-right-radius: 0.4rem;
  //    }
  //  }
  //}
`;

const StyledTable = styled.table`
  border-collapse: separate;

  th,
  td {
    transition: 0.15s;
  }
`;

const HeaderBackground = styled.div`
  z-index: 1;
  height: 2rem;
`;

const TableFooter = styled.button`
  border-radius: 0 0 1rem 1rem;
  transition: 0.3s;
  border: 0;

  &:hover {
    transform: scale(1.02);
  }
`;

interface Props {
  cluster: getClustersPreview_taskInfo_data_result_TypoClusterTaskResult_TypoClusters;
  selectedDependency: FunctionalDependency;
}

const Cluster: React.FC<Props> = ({ cluster, selectedDependency }) => {
  const { datasetLoading, dataset } = useContext(TaskContext)!;

  const [isSquashed, setIsSquashed] = useState(false);
  const [headerWidth, setHeaderWidth] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const colorizedColumns = selectedDependency.lhs
    .map(({ name }) => name)
    .concat(selectedDependency.rhs.name);
  const rows = cluster.items?.map(({ row }) => row) || [[]];
  const header =
    (dataset?.snippet?.header && dataset.snippet.header) ||
    cluster.items![0].row.map((_, index) => `Attr ${index}`);

  const changeWidth = useCallback((node: HTMLDivElement) => {
    if (node) {
      setHeaderWidth(node.clientWidth);
    }
  }, []);

  const changeHeight = useCallback((node: HTMLTableRowElement) => {
    if (node) {
      setHeaderHeight(node.clientHeight);
    }
  }, []);

  const colorizedPart = header
    .map((col, index) => ({
      col,
      index,
    }))
    .filter(({ col }) => colorizedColumns.includes(col));
  const uncolorizedPart = header
    .map((col, index) => ({
      col,
      index,
    }))
    .filter(({ col }) => !colorizedColumns.includes(col));

  const isSuspicions = (row: number) => cluster.items![row].isSuspicious;
  const toggleIsSquashed = () => setIsSquashed((prev) => !prev);

  const headerClassName =
    "px-4 py-3 text-white text-nowrap text-center position-relative";
  const bodyClassName = "text-center py-1 px-2";

  return (
    <div className="my-2 w-auto" ref={changeWidth}>
      <Toggle toggleCondition={isSquashed} onClick={toggleIsSquashed} variant="dark" >Squashed</Toggle>
      <StyledTable>
        <HeaderBackground
          className="position-absolute bg-light"
          style={{
            width: headerWidth,
            transform: `translateY(-${headerHeight + 6}px`,
          }}
        />
        <TableHeader className="bg-light position-relative">
          {/* @ts-ignore */}
          <tr className="bg-light" ref={changeHeight}>
            <th
              className={headerClassName}
              style={{
                backgroundColor: "#17151a80",
              }}
            >
              Row Index
            </th>
            {colorizedPart.map(({ col }) => (
              <th
                key={col}
                className={headerClassName}
                style={{
                  backgroundColor: stringToColor(col, 60, 70),
                }}
              >
                {col}
              </th>
            ))}
            {uncolorizedPart.map(({ col }) => (
              <th
                key={col}
                className={headerClassName}
                style={{
                  backgroundColor: "#17151a",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </TableHeader>

        <TableBody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="position-relative">
              <td
                className={bodyClassName}
                style={{
                  backgroundColor: isSuspicions(rowIndex)
                    ? colors.tableHighlightPurple
                    : stringToColor("", 0, rowIndex % 2 ? 80 : 90),
                }}
              >
                {cluster.items![rowIndex].rowIndex}
              </td>
              {colorizedPart.map(({ col, index }) => (
                <td
                  key={index}
                  className={bodyClassName}
                  style={{
                    backgroundColor: isSuspicions(rowIndex)
                      ? colors.tableHighlightPurple
                      : stringToColor(col, 15, rowIndex % 2 ? 80 : 90),
                  }}
                >
                  {row[index]}
                </td>
              ))}
              {uncolorizedPart.map(({ col, index }) => (
                <td
                  key={index}
                  className={bodyClassName}
                  style={{
                    backgroundColor: isSuspicions(rowIndex)
                      ? colors.tableHighlightPurple
                      : stringToColor(col, 0, rowIndex % 2 ? 80 : 90),
                  }}
                >
                  {row[index]}
                </td>
              ))}
            </tr>
          ))}
        </TableBody>
      </StyledTable>
      <TableFooter className="bg-dark text-white text-center p-2 w-100">
        Load More...
      </TableFooter>
    </div>
  );
};

export default Cluster;