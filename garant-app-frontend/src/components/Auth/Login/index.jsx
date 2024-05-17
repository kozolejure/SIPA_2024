import React, { useState } from 'react';
import styles from './styles.module.css';
import {FaEye, FaEyeSlash} from 'react-icons/fa';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Logika za prijavo
    console.log('Login with', email, password);
  };


return (
    <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.title}>Login</h2>
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
                        {showPassword ? <FaEyeSlash/> : <FaEye/>}
                    </span>
                </div>
            </div>
            <br/>
            <button type="submit" className={styles.button}>Log In</button>
        </form>
    </div>
);
}

export default LoginForm;
