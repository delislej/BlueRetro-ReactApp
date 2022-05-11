import React from "react";

function Logbox(){
    return (
        <div id="output" className="output">
            <div id="content" style={{backgroundColor: "#f0f0f0", borderRadius: "0.75em", display: "block", margin: "0.5em", padding: "0.5em"}}>
              <div id="status" style={{margin: ".5em 0", fontStyle: "italic"}}>
                <pre id="log" style={{margin: ".5em 0", whiteSpace: "pre-wrap"}}></pre>
              </div>
            </div>
          </div>
    );
}

export default Logbox;