import React from 'react';
import { useEffect, useState } from 'react';
import { deleteTokens, getTokens, saveTokens } from '../../utils/tokensIndexedDB';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import ProductCard from './ProductCard/index.tsx';
import styles from './styles.module.css';

function HomeScreen() {
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        console.log("getting tokens");
        try {
            getTokens().then(async (tokens) => {
                if (tokens.jwtToken) {
                    console.log("tokens", tokens);

                    const decodedToken = jwtDecode(tokens.jwtToken);

                    setUser(decodedToken);

                    console.log("decodedTokenssssss: ", decodedToken.id);

                    const isExpired = decodedToken.exp! * 1000 < Date.now();

                    if (isExpired) {
                        const response = await axios.post("http://localhost:3001/refreshToken", {
                            refreshToken: tokens.refreshToken
                        });

                        if (response.status === 200) {
                            console.log("refresh token success");
                            saveTokens(response.data.jwtToken, response.data.refreshToken)
                        } else {
                            deleteTokens();
                            navigate('/login');
                        }
                    } else {
                        console.log("not expired");
                    }

                    console.log("decodedToken", decodedToken);
                } else {
                    console.log("no tokens");
                    navigate('/login');
                }
            }
            ).catch((error) => {
                console.log("error getting tokens", error);
                navigate('/login');
            });
        }
        catch (error) {
            console.log("erro getting tokens", error);
            navigate('/login');
        }

        const fetchData = async () => {
            try {
                console.log("fetching data with user id: ", user.id);
                const response = await axios.get("http://localhost:3002/users/" + user.id + "/items");
                setProducts(response.data);
                console.log("fetched data", response.data)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [user.id]);

    const logout = () => {
        deleteTokens();
        navigate('/login');
    };

    return (
        <div>
            <div className={styles.nav}>
                <label>Home</label>
                <button onClick={() => navigate('/add-product')}>Dodaj izdelek</button>
                <button onClick={() => { logout() }}>Odjava</button>
            </div>

            <div className={styles.container}>
                {
                    products.map(product => (
                        <ProductCard key={product} product={product} onViewDetails={null} />
                    ))
                }
            </div >
        </div >
    );
}

export default HomeScreen;

