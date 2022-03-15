/* eslint-disable */

import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  useParams,
  useHistory,
} from "react-router-dom";
import axios from "axios";

import "./Viewer.scss";
import PieChartFull from "../PieChartFull/PieChartFull";
import DependencyListFull from "../DependencyListFull/DependencyListFull";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import Button from "../Button/Button";
import ProgressBar from "../ProgressBar/ProgressBar";
import Phasename from "../Phasename/Phasename";
import { serverURL } from "../../APIFunctions";
import {
  taskStatus,
  attribute,
  dependency,
  dependencyEncoded,
} from "../../types";

const Viewer: React.FC<Props> = ({ file, setFile }) => {
  let { taskID } = useParams<{ taskID: string }>();
  const history = useHistory();

  const [taskProgress, setTaskProgress] = useState(0.6);
  const [phaseName, setPhaseName] = useState("Mining dependencies");
  const [currentPhase, setCurrentPhase] = useState(3);
  const [maxPhase, setMaxPhase] = useState(5);
  const [taskStatus, setTaskStatus] = useState<taskStatus>("UNSCHEDULED");
  const [filename, setFilename] = useState<string>("Todo"); //TODO: add file name to taskInfo

  const [attributesLHS, setAttributesLHS] = useState<coloredAttribute[]>([]);
  const [attributesRHS, setAttributesRHS] = useState<coloredAttribute[]>([]);

  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    attribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    attribute[]
  >([]);

  const [dependencies, setDependencies] = useState<dependency[]>([]);

  const taskFinished = (status: taskStatus) =>
    status === "COMPLETED" || status === "SERVER ERROR";

  // setInterval(() => setTaskProgress(taskProgress + 0.05), 300);

  useEffect(() => {
    const fetchData = async () => {
      axios
        .get(`${serverURL}/getTaskInfo?taskID=${taskID}`, { timeout: 2000 })
        .then((task) => task.data)
        .then((data) => {
          console.log(data);
          // setTaskProgress(data.progress);
          setPhaseName(data.phasename);
          setTaskStatus(data.status);
          if (taskFinished(data.status)) {
            setAttributesLHS(data.arraynamevalue.lhs);
            setAttributesRHS(data.arraynamevalue.rhs);
            setDependencies(
              data.fds.map((dep: dependencyEncoded) => ({
                lhs: dep.lhs.map((attrNum) => data.arraynamevalue.lhs[attrNum]),
                rhs: data.arraynamevalue.rhs[dep.rhs],
              }))
            );
          }
        })
        .catch((error) => {
          console.error(error);
          history.push("/error");
        });
    };

    const timer = setInterval(() => {
      if (!taskFinished(taskStatus)) {
        fetchData();
      }
    }, 1000);

    return () => clearInterval(timer);
  });

  return (
    <>
      <div className="top-bar">
        <header>
          <div className="left">
            <img src="/icons/logo.svg" alt="logo" className="logo-medium" />
            <h1>File: "{filename}"</h1>
            <h1>Status: {taskStatus}</h1>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              onChange={(e) =>
                setTaskProgress(+(e.target as HTMLInputElement).value)
              }
            />
          </div>
          <Button type="button" color="1" onClick={() => history.push("/")}>
            Cancel
          </Button>
        </header>
        <ProgressBar progress={taskProgress} maxWidth={100} thickness={0.5} />
        <Phasename
          currentPhase={currentPhase}
          maxPhase={maxPhase}
          phaseName={phaseName}
          progress={taskProgress}
        ></Phasename>
      </div>
      <Router>
        {/* <Switch> */}
        <Route path={`/attrs/${taskID}`}>
          <div className="bg-light">
            {taskFinished(taskStatus) ? null : (
              <StatusDisplay type="loading" text="Loading" />
            )}
            <div
              className="charts-with-controls"
              style={{
                opacity: taskFinished(taskStatus) ? 1 : 0,
              }}
            >
              <PieChartFull
                title="Left-hand side"
                attributes={attributesLHS}
                selectedAttributes={selectedAttributesLHS}
                setSelectedAttributes={setSelectedAttributesLHS}
              />
              <PieChartFull
                title="Right-hand side"
                attributes={attributesRHS}
                maxItemsSelected={1}
                selectedAttributes={selectedAttributesRHS}
                setSelectedAttributes={setSelectedAttributesRHS}
              />
            </div>
            <footer style={{ opacity: taskFinished(taskStatus) ? 1 : 0 }}>
              <h1 className="bottom-title">View Dependencies</h1>
              <Link to={`/deps/${taskID}`}>
                <Button type="button" color="0" onClick={() => {}}>
                  <img src="/icons/nav-down.svg" alt="down" />
                </Button>
              </Link>
            </footer>
          </div>
        </Route>
        <Route path={`/deps/${taskID}`}>
          <div className="bg-light" style={{ justifyContent: "space-between" }}>
            <DependencyListFull
              dependencies={dependencies}
              selectedAttributesLHS={selectedAttributesLHS}
              selectedAttributesRHS={selectedAttributesRHS}
            />
            <footer>
              <h1
                className="bottom-title"
                style={{ color: "#000", fontWeight: 500 }}
              >
                View Attributes
              </h1>
              <Link to={`/attrs/${taskID}`}>
                <Button type="button" color="0" onClick={() => {}}>
                  <img src="/icons/nav-up.svg" alt="up" />
                </Button>
              </Link>
            </footer>
          </div>
        </Route>
        {/* </Switch> */}
      </Router>
    </>
  );
};

export default Viewer;
