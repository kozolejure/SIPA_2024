// src/components/Auth/RegisterForm/index.jsx
import React, { useState } from 'react';
import styles from '../styles.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setPasswordError(true);
            return;
        }
        // TODO: Logika za registracijo
        console.log('Register with', email, password);
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Register</h2>
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
                <button type="submit" className={styles.button}>Register</button>
            </form>
        </div>
    );

}

export default RegisterForm;
