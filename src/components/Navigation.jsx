import React from "react";
import { NavLink } from "react-router-dom";

function Navigation() {
  return (
    <div className="navigation">
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container" >
          <NavLink className="navbar-brand" to="/">
            BlueRetro Web Config
          </NavLink>
          <div>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Home
                  <span className="sr-only">(current)</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/Advancedconfig">
                  Advanced Config
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/n64ctrlpak">
                  N64 Controller pak manager
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/presets">
                  Presets
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/bindcontroller">
                  Bind Controller
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/ota">
                  OTA Update
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navigation;