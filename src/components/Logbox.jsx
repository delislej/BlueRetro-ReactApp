import React from "react";
import Paper from "@mui/material/Paper";

export const ChromeSamples = {
  log: function () {
    var line = Array.prototype.slice
      .call(arguments)
      .map(function (argument) {
        return typeof argument === "string"
          ? argument
          : JSON.stringify(argument);
      })
      .join(" ");
    let temp = document.querySelector("#log").textContent;
    document.querySelector("#log").textContent = line + "\n" + temp;
  },

  clearLog: function () {
    document.querySelector("#log").textContent = "";
  },

  setStatus: function (status) {
    document.querySelector("#status").textContent = status;
  },

  setContent: function (newContent) {
    var content = document.querySelector("#content");
    while (content.hasChildNodes()) {
      content.removeChild(content.lastChild);
    }
    content.appendChild(newContent);
  },
};

function Logbox() {
  return (
    <Paper sx={{ backgroundColor: "#bbdefb",
    marginBottom: "10px",
    p: 1,
    width: "100%",
    maxWidth: "600px", }}>
      <pre
        id="log"
        style={{ margin: ".5em 0", whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: "100px", fontStyle: "italic", minHeight: "100px" }}
      ></pre>
    </Paper>
  );
}

export default Logbox;
