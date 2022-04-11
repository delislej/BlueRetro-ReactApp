import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Blueretro from "./components/Blueretro";
import N64ctrlpak from "./components/N64ctrlpak";
import Home from "./components/Home";
import Presets from "./components/Presets";
import Navigation from "./components/Navigation";

ReactDOM.render(
  <Router>
    <Navigation />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/n64ctrlpak" element={<N64ctrlpak />} />
      <Route path="/blueretro" element={<Blueretro />} />
      <Route path="/presets" element={<Presets />} />
    </Routes>
  </Router>,

  document.getElementById("root")
);

serviceWorker.unregister();