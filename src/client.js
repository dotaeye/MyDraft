import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import App from "./containers/App";

// import { Router, browserHistory } from "react-router";
// import createRoutes from "./routes";

// ReactDOM.render(
//   <Router routes={createRoutes()} history={browserHistory} />,
//   document.getElementById("main")
// );

ReactDOM.render(<App />, document.getElementById("main"));
