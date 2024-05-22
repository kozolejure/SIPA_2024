// Filename - App.js

import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import Registration from "./components/Auth/Registration";
import HomeScreen from "./components/Home/index.tsx";

import "./App.css";
import FirstLogin from "./components/Auth/FirstLogin/index.jsx";
import AddProduct from "./components/Home/AddProduct/index.jsx";
import ProductDetails from './components/Home/ViewProductDetails/index.tsx';
import EditProduct from './components/Home/EditProducts/Editproduct.tsx';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/first-login" element={<FirstLogin />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/edit/:id" element={<EditProduct />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
