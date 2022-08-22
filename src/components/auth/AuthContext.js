import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
    const baseURL = 'https://aq-budget-track.herokuapp.com/api';
    // const baseURL = process.env.BASEURL || "http://127.0.0.1:8000/api";

    const [authTokens, setAuthTokens] = useState( () =>
        localStorage.getItem("authTokens") ? 
        JSON.parse(localStorage.getItem("authTokens")) : null);

    const [user, setUser] = useState( () => 
        localStorage.getItem("authTokens") ? 
        jwt_decode(localStorage.getItem("authTokens")) : null);

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const loginUser = async (username, password) => {
        const response = await fetch(`${baseURL}/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        })
        const data = await response.json();

        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwt_decode(data.access));
            localStorage.setItem("authTokens", JSON.stringify(data));
            navigate("/");
        } else {
            alert("Wrong password or username");
        }
    }

    const registerUser = async (username, password, password2) => {
        const response = await fetch(`${baseURL}/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                password2
            })
        });

        if (response.status === 201) {
            navigate("/login");
        } else {
            alert("Something went wrong!");
        }
    }

    const updateUser = async (newUsername, oldPassword, password, password2) => {
        let response = await fetch(`${baseURL}/updateUser/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authTokens?.access}`
            },
            body: JSON.stringify({
                newUsername,
                oldPassword,
                password,
                password2
            }),
        });
        if (response.status === 401) {
            let refreshRes = await fetch(`${baseURL}/token/refresh/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authTokens?.access}`
                }, 
                body: JSON.stringify({
                    refresh: authTokens?.refresh
                })
            });
            const data = await refreshRes.json();
            if (refreshRes.status === 200) {
                localStorage.setItem("authTokens", JSON.stringify(data));
                setAuthTokens(data);
                setUser(jwt_decode(data.access));
                let retryRes = await fetch(`${baseURL}/updateUser/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${data.access}`
                    },
                    body: JSON.stringify({
                        newUsername,
                        oldPassword,
                        password,
                        password2
                    }),
                })
                let retryResData = await retryRes.json()
                if (retryRes.status === 200) { // update user
                    loginUser(newUsername, password).then(
                        ()=>{navigate("/settings/");}  
                    );
                }
                return retryResData;
            
            }
            
        }
        let data = await response.json();
        if (response.status === 200) { // update user
            loginUser(newUsername, password).then(
              ()=>{navigate("/settings/");}  
            );
        }
        return data;
    }

    const updateUsername = async (newUsername, password) => {
        let response = await fetch(`${baseURL}/updateUsername/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authTokens?.access}`
            },
            body: JSON.stringify({
                newUsername,
                password,
            }),
        });
        if (response.status === 401) {
            let refreshRes = await fetch(`${baseURL}/token/refresh/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authTokens?.access}`
                }, 
                body: JSON.stringify({
                    refresh: authTokens?.refresh
                })
            });
            const data = await refreshRes.json();
            if (refreshRes.status === 200) {
                localStorage.setItem("authTokens", JSON.stringify(data));
                setAuthTokens(data);
                setUser(jwt_decode(data.access));
                let retryRes = await fetch(`${baseURL}/updateUsername/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${data.access}`
                    },
                    body: JSON.stringify({
                        newUsername,
                        password,
                    }),
                })
                let retryResData = await retryRes.json()
                if (retryRes.status === 200) { // updated user
                    loginUser(newUsername, password).then(
                        ()=>{navigate("/settings/");}  
                    );
                }
                return retryResData;
            }
        }
        let data = await response.json();
        if (response.status === 200) { // update user
            loginUser(newUsername, password).then(
              ()=>{navigate("/settings/");}  
            );
        }
        console.log(data)
        return data;
    }


    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        navigate('/');
    }

    const contextData = {
        user,
        setUser,
        authTokens,
        setAuthTokens,
        registerUser,
        loginUser,
        logoutUser,
        updateUser,
        updateUsername
    }

    useEffect( () => {
        if (authTokens) {
            setUser(jwt_decode(authTokens.access));
        }
        setLoading(false);
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );


}