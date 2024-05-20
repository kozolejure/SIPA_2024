// Filename - App.js

import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./components/Auth/Login";
import Registration from "./components/Auth/Registration";
import HomeScreen from "./components/Home/index.tsx";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={<Login />}
            ></Route>
            <Route
              path="/login"
              element={<Login />}>
            </Route>
            <Route
              path="/app"
              element={<HomeScreen />}
            ></Route>
            <Route
              path="/registration"
              element={<Registration />}
            ></Route>
          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
