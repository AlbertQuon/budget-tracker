import axios from "axios";
import jwt_decode from "jwt-decode";
import dayjs from "dayjs";
import { useContext } from "react";
import AuthContext from "../auth/AuthContext";

const baseURL = "http://127.0.0.1:8000/api";

const useAxios = () => {
    const {authTokens, setUser, setAuthTokens, logoutUser} = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${authTokens?.access}`}
    });

    const isRefreshing = false;

    axiosInstance.interceptors.request.use(async req => {
        const user = jwt_decode(authTokens.access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req;

        const response = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: authTokens.refresh
        });
        // if refresh fails, logout user

        // update storage
        localStorage.setItem("authTokens", JSON.stringify(response.data));

        // update context api
        setAuthTokens(response.data);
        setUser(jwt_decode(response.data.access));

        req.headers.Authorization = `Bearer ${response.data.access}`;
        /*logoutUser();
        return {
            ...req,
            signal: AbortSignal.abort()
        };*/

        return req;
    }, (error) => {
      return Promise.reject(error);
    });

    /*axiosInstance.interceptors.response.use(async (res) => {
        return res;
    }, async function (error) {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const response = await axios.post(`${baseURL}/token/refresh/`, {
                refresh: authTokens.refresh
            });            
            localStorage.setItem("authTokens", JSON.stringify(response.data));

            setAuthTokens(response.data);
            setUser(jwt_decode(response.data.access));

            return axiosInstance(originalRequest);
        }
        return Promise.reject(error);
    })*/

    return axiosInstance;
}

export default useAxios;