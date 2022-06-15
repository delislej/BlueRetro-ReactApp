import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import Home from "./components/Home";
import Paper from "@mui/material/Paper";
import { MemoryRouter } from "react-router-dom";

ReactDOM.render(
  <Paper
    square
    className="index paper"
    sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#a6adff",
      overflowY: "auto",
    }}
  >
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  </Paper>,
  document.getElementById("root")
);
serviceWorker.unregister();
