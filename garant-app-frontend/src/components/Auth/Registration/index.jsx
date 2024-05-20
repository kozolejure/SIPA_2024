// src/components/Auth/RegisterForm/index.jsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles.module.css';

import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ClipLoader from "react-spinners/ClipLoader";

import NotificationPortal from '../../NotificationPortal.js'
import useNotification from "../../../hooks/useNotification.js";

function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const notify = useNotification();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            setPasswordError(true);
            return;
        }
        else {
            console.log('Register with', email, password);

            try {
                const response = await axios.post('http://localhost:3001/register', {
                    username: username,
                    email: email,
                    password: password
                });

                setLoading(false);

                if (response.status === 200) {
                    console.log(response.data);
                    notify('success', 'Registration successful!');
                }
                else {
                    console.log(response.data);
                    notify('error', 'Registration failed!');
                }
            } catch (error) {
                setLoading(false);

                console.error(error);
                notify('error', 'Registration failed!');
            }
        }
    };

    return (
        <div className={styles.container}>
            <NotificationPortal />
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Register</h2>
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
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <div className={styles.inputGroup}>
                    <label>Confirm Password</label>
                    <div className={styles.passwordInput}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span
                            className={styles.eyeIcon}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {passwordError && <div className={styles.errorText}>Passwords do not match!</div>}
                <button type="submit" className={styles.button}>
                    {loading ? <ClipLoader color="#ffffff" loading={loading} /> : "Register"}
                </button>
            </form>
        </div>
    );

}

export default RegisterForm;
