import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import EDPList from "./EDPList";
import Navigation from "../Navigation";
import { FunctionalDependency } from "../../../types/taskInfo";
import { TaskContext } from "../../TaskContext";
import TableSnippet from "../TableSnippet/TableSnippet";
import EDPClusters from "./EDPClusters";

const tabs = ["Dependencies", "Clusters", "Dataset"];

const Index = () => {
  const { taskResult } = useContext(TaskContext)!;

  const [partShown, setPartShown] = useState(0);
  const [selectedDependency, setSelectedDependency] =
    useState<FunctionalDependency | null>(null);

  return (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column align-items-start">
      <Navigation
        partShown={partShown}
        setPartShown={setPartShown}
        options={tabs}
      />

      {partShown === 0 && (
        <EDPList
          selectedDependency={selectedDependency}
          setSelectedDependency={setSelectedDependency}
        />
      )}

      {partShown === 1 && selectedDependency && (
        <EDPClusters
          selectedDependency={selectedDependency}
        />
      )}

      {partShown === 2 && (
        <TableSnippet
          selectedColumns={
            selectedDependency
              ? selectedDependency.lhs.concat(selectedDependency.rhs)
              : []
          }
        />
      )}
    </Container>
  );
};

export default Index;