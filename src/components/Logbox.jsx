import React from "react";

export const ChromeSamples = {
  log: function() {
    var line = Array.prototype.slice.call(arguments).map(function(argument) {
      return typeof argument === 'string' ? argument : JSON.stringify(argument);
    }).join(' ');

    document.querySelector('#log').textContent += line + '\n';
  },

  clearLog: function() {
    document.querySelector('#log').textContent = '';
  },

  setStatus: function(status) {
    document.querySelector('#status').textContent = status;
  },

  setContent: function(newContent) {
    var content = document.querySelector('#content');
    while(content.hasChildNodes()) {
      content.removeChild(content.lastChild);
    }
    content.appendChild(newContent);
  }
};

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