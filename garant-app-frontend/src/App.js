// Filename - App.js

import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./components/Auth/Login";
import Registration from "./components/Auth/Registration";
import HomeScreen from "./components/Home/index.tsx";

import "./App.css";
import FirstLogin from "./components/Auth/FirstLogin/index.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/first-login" element={<FirstLogin />} />
        <Route path="/" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
