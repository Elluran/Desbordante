import React, {useCallback, useState} from "react";
import styled from "styled-components";
import {Container} from "react-bootstrap";

import stringToColor from "../../../functions/stringToColor";
import {getDataset_taskInfo_dataset_snippet} from "../../../graphql/operations/queries/__generated__/getDataset";

const StyledContainer = styled(Container)`
  height: 70vh;
`;

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
  tr {
    &:last-of-type {
      td:first-of-type {
        border-bottom-left-radius: 1rem;
      }

      td:last-of-type {
        border-bottom-right-radius: 1rem;
      }
    }
  }
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

interface Props {
  colorizedItems: string[];
  showUncolorizedColumns?: boolean;
  className?: string;
  data: getDataset_taskInfo_dataset_snippet;
}

const ARTable: React.FC<Props> = ({
                                    colorizedItems,
                                    showUncolorizedColumns = true,
                                    className = "",
                                    data,
                                  }) => {
  const [headerWidth, setHeaderWidth] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const rows = data?.rows || [[]];
  const header =
    data &&
    (data.header
      ? data.header.map((elem) => elem || "null")
      : rows[0].map((_, index) => `Item ${index + 1}`));

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

  const colorizedPart = rows.filter((row) => row.some((item) => colorizedItems.includes(item)));
  const uncolorizedPart = rows.filter((row) => row.every((item) => !colorizedItems.includes(item)));

  const headerClassName =
    "px-4 py-3 text-white text-nowrap text-center position-relative";
  const bodyClassName = "text-center py-1 px-2";

  return (
    <StyledContainer
      fluid
      className="w-100 px-0 overflow-auto flex-grow-1 my-2"
      ref={changeWidth}
    >
      <StyledTable className={className}>
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
            {header.map((col) => (
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
          {colorizedPart.map((row, rowIndex) => (
            <tr key={rowIndex} className="position-relative">
              {row.map((item) => (
                <td
                  key={item}
                  className={bodyClassName}
                  style={{
                    backgroundColor: stringToColor(
                      item,
                      colorizedItems.includes(item) ? 15 : 0,
                      rowIndex % 2 ? 80 : 90
                    ),
                  }}
                >
                  {item}
                </td>
              ))}
            </tr>
          ))}
          {showUncolorizedColumns && uncolorizedPart.map((row, rowIndex) => (
            <tr key={rowIndex} className="position-relative">
              {row.map((item) => (
                <td
                  key={item}
                  className={bodyClassName}
                  style={{
                    backgroundColor: stringToColor(
                      item,
                      0,
                      rowIndex % 2 ? 80 : 90
                    ),
                  }}
                >
                  {item}
                </td>
              ))}
            </tr>
          ))}
        </TableBody>
      </StyledTable>
    </StyledContainer>
  );
};

export default ARTable;
