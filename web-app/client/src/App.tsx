import React, { useContext } from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";

import HomeScreen from "./components/HomeScreen/HomeScreen";
import ErrorScreen from "./components/ErrorScreen/ErrorScreen";
import Viewer from "./components/Viewer";
import TopBar from "./components/TopBar/TopBar";
import SignUpForm from "./components/SignUpForm";
import FeedbackForm from "./components/FeedbackForm";
import { ErrorContext } from "./components/ErrorContext";
import { AuthContext } from "./components/AuthContext";
import LogInForm from "./components/LogInForm/LogInForm";
import FeedbackButton from "./components/FeedbackButton/FeedbackButton";

const App: React.FC = () => {
  const { isErrorShown } = useContext(ErrorContext)!;
  const { isSignUpShown, isFeedbackShown, isLogInShown } =
    useContext(AuthContext)!;

  return (
    <div className="App bg-light d-flex flex-column min-vh-100">
      <Router>
        <TopBar />
        {isSignUpShown && <SignUpForm />}
        {isFeedbackShown && <FeedbackForm />}
        {isLogInShown && <LogInForm />}
        {isErrorShown && <ErrorScreen />}
        <FeedbackButton />
        <Switch>
          <Route path="/:taskID">
            <Viewer />
          </Route>

          <Route path="/">
            <HomeScreen />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
