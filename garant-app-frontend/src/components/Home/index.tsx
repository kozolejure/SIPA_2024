import React from 'react';
import { useEffect } from 'react';
import { deleteTokens, getTokens, saveTokens } from '../../utils/tokensIndexedDB';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function HomeScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("getting tokens");
        try {
            getTokens().then(async (tokens) => {
                if (tokens.jwtToken) {
                    console.log("tokens", tokens);
                    const decodedToken = jwtDecode(tokens.jwtToken);
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
    });

    return (
        <div>
            <h1>Home screen</h1>
        </div>
    );
}

export default HomeScreen;

