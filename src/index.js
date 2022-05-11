import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import N64ctrlpak from "./components/N64ctrlpak";
import Home from "./components/Home";
import Presets from "./components/Presets";
import Navigation from "./components/Navigation";
import Ota from "./components/Ota";
import Advancedconfig from "./components/Advancedconfig";
import BindController from "./components/Bindcontroller";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Navigation />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/n64ctrlpak" element={<N64ctrlpak />} />
      <Route path="/advancedconfig" element={<Advancedconfig />} />
      <Route path="/presets" element={<Presets />} />
      <Route path="/bindcontroller" element={<BindController />} />
      <Route path="/ota" element={<Ota />} />
    </Routes>
  </Router>
);

serviceWorker.unregister();