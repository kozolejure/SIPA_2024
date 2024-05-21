import React, { useState } from 'react';
import styles from '../styles.module.css';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ClipLoader from "react-spinners/ClipLoader";

import NotificationPortal from '../../NotificationPortal.js'
import useNotification from "../../../hooks/useNotification.js";
import { getTokens } from '../../../utils/tokensIndexedDB.js';

function FirstLogin() {
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const notify = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            console.log('Save data with', firstName, lastName);

            const tokens = await getTokens();

            var userDecodedJwt = jwtDecode(tokens.jwtToken);

            const response = await axios.post('http://localhost:3002/users', {
                _id: userDecodedJwt.id,
                firstName: firstName,
                lastName: lastName,
                email: userDecodedJwt.email
            });

            console.log("To je status: " + response.status);

            setLoading(false);

            if (response.status === 201) {
                notify('success', 'Data saved successfully!');
                setTimeout(() => { }, 3000);
                navigate('/');
            } else {
                console.error(response);
                notify('error', 'Data save failed!');
            }
        }
        catch (error) {
            setLoading(false);
            console.error(error);
            notify('error', 'Data save failed!');
        }
    };

    return (
        <div className={styles.container}>
            <NotificationPortal />
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Personal data</h2>
                <p>This is your first login in app</p>
                <div className={styles.inputGroup}>
                    <label>Name</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Surname</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <br />

                <button type="submit" className={styles.button}>
                    {loading ? <ClipLoader color="#ffffff" loading={loading} /> : "Save data"}
                </button>
            </form>
        </div>
    );
}

export default FirstLogin;
