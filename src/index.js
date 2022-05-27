import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import Home from "./components/Home";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
<BrowserRouter>
<Home />
</BrowserRouter>
, document.getElementById("root"));
serviceWorker.unregister();
