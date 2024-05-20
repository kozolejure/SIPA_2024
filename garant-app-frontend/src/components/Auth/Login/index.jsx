import React, { useState } from 'react';
import styles from '../styles.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import ClipLoader from "react-spinners/ClipLoader";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import NotificationPortal from '../../NotificationPortal.js'
import useNotification from "../../../hooks/useNotification.js";

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

            setLoading(false);

            console.log(response.data);
            navigate('/app');
        } catch (error) {
            setLoading(false);
            console.error(error);
            notify('error', 'Login failed!');
        }
    };

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
