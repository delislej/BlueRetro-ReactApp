import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import { useGamepads } from 'react-gamepads';

function App() {
  const [gamepads, setGamepads] = useState({});
  useGamepads(gamepads => setGamepads(gamepads));

  const gamepadDisplay = Object.keys(gamepads).map(gamepadId => {
    console.log("displaying gamepad", gamepads[gamepadId]);
    return (
      <div>
        <h2>{gamepads[gamepadId].id}</h2>
        {gamepads[gamepadId].buttons &&
          gamepads[gamepadId].buttons.map((button, index) => (
            <div>
              {index}: {button.pressed ? 'True' : 'False'}
            </div>
          ))
        }

<h2>{"axes"}</h2>
        {gamepads[gamepadId].buttons &&
          gamepads[gamepadId].axes.map((axes, index) => (
            <div>
              {index}: {axes > .3 || axes < -.3 ? axes : ""}
            </div>
          ))
        }
      </div>
    );
  });

  return (
    <div className="Gamepads">
      <h1>Gamepads 1</h1>
      {gamepadDisplay}
    </div>
  );
}

export default App;
