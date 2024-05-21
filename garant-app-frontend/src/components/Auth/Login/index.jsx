import React, { useState } from 'react';
import styles from '../styles.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import ClipLoader from "react-spinners/ClipLoader";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import NotificationPortal from '../../NotificationPortal.js'
import useNotification from "../../../hooks/useNotification.js";
import { saveTokens } from '../../../utils/tokensIndexedDB.js';

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const notify = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        console.log('Login with', username, password);

        try {
            const response = await axios.post('http://localhost:3001/login', {
                username: username,
                password: password
            });

            saveTokens(response.data.token, response.data.refreshToken)

            const isFirstTimeLogin = await checkIfIsFirstTimeLogin(response.data.user.id);
            console.log("isFirstTimeLogin: " + isFirstTimeLogin);

            setLoading(false);

            if (isFirstTimeLogin) {
                navigate('/first-login');
                return;
            }
            else {
                console.log(response.data);
                navigate('/');
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            notify('error', 'Login failed!');
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

    return (
        <div className={styles.container}>
            <NotificationPortal />
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Login</h2>
                <div className={styles.inputGroup}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Password</label>
                    <div className={styles.passwordInput}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className={styles.eyeIcon}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                <div className={styles.createAccount}>
                    <span>Don't have an account?</span>
                    &nbsp;
                    <a href="/registration">Create Account</a>
                </div>

                <br />
                <button type="submit" className={styles.button}>
                    {loading ? <ClipLoader color="#ffffff" loading={loading} /> : "Log In"}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
