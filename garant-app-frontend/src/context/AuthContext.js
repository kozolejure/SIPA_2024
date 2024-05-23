// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveTokens, deleteTokens, getTokens } from '../utils/tokensIndexedDB';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const tokens = await getTokens();

            if (tokens && tokens.jwtToken) {
                try {
                    const decodedToken = jwtDecode(tokens.jwtToken);
                    setUser(decodedToken);
                    navigate('/');

                    if (!decodedToken) {
                        logout();
                    }
                } catch (error) {
                    console.error('Error decoding token:', error);
                    logout();
                }
            }
        };

        checkUser();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:3001/login', { username, password });
            const decodedToken = jwtDecode(response.data.token);
            saveTokens(response.data.token, response.data.refreshToken);
            setUser(decodedToken);

            const isFirstTimeLogin = await checkIfIsFirstTimeLogin(response.data.user.id);
            console.log("isFirstTimeLogin: " + isFirstTimeLogin);

            if (isFirstTimeLogin) {
                navigate('/first-login');
                return;
            }
            else {
                console.log(response.data);
                navigate('/');
            }

            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const checkIfIsFirstTimeLogin = async (userId) => {
        try {
            console.log("Checking if is first time login for user:", userId);
            const response = await axios.get(`http://localhost:3002/users/${userId}`);
            console.log("Response status:", response.status);  // This will show the actual response status code
            return response.status === 404;
        } catch (error) {
            console.error("Error checking user's first-time login status:", error);
            if (error.response) {
                console.log("Error response status:", error.response.status);  // This will show the error status code if there is an error response
                return error.response.status === 404;  // Handle specific status code on error
            }
            return false;
        }
    }

    const logout = () => {
        deleteTokens();
        setUser(null);
        navigate('/login');
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
