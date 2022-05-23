import React from "react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

export const ChromeSamples = {
  log: function() {
    var line = Array.prototype.slice.call(arguments).map(function(argument) {
      return typeof argument === 'string' ? argument : JSON.stringify(argument);
    }).join(' ');
    let temp  = document.querySelector('#log').textContent;
    document.querySelector('#log').textContent = line + '\n' + temp;
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
          <Box sx={{
          my: 1,
          mx: 'auto',
          p: 2,
          width: '75%'
        }}>
          <Paper>
            
              <div id="status" style={{margin: ".5em 0", fontStyle: "italic", height: '100px', overflowY: 'scroll' }}>
                <pre sx={{
          my: 1,
          mx: 'auto',
          p: 2,
        }} id="log" style={{margin: ".5em 0", whiteSpace: "pre-wrap"}}></pre>
              </div>
            
            </Paper>
          </Box>
          </div>
    );
}

export default Logbox;