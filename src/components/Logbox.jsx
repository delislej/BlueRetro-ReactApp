import React from "react";
import Paper from "@mui/material/Paper";

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
