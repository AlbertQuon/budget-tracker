import axios from "axios";
import jwt_decode from "jwt-decode";
import { useContext } from "react";
import AuthContext from "../auth/AuthContext";

// const baseURL = 'https://aq-budget-track.herokuapp.com/api';
const baseURL = process.env.BASEURL || "http://127.0.0.1:8000/api";

axios.defaults.xsrfCookieName = 'csrftoken'; 
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const useAxios = () => {
    const {authTokens, setUser, setAuthTokens, logoutUser} = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${authTokens?.access}`}
    });
    var recentToken = authTokens;
    let isTokenRefreshing = false;
    var failedQueue = [];
    
    const processQueue = (error, token = null) => {
        failedQueue.forEach(promise => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve(token);
            }
        })
        failedQueue = [];
    }

    axiosInstance.interceptors.response.use(async (res) => {
        return res;
    }, async function (error) {
        const originalRequest = error.config;
        
        if (error.response.status === 401 && !originalRequest._retry) {
            if (recentToken.refresh !== authTokens.refresh) {
                // if the token was not saved to storage in time, use the token stored in this axios instance
                originalRequest.headers['Authorization'] = 'Bearer ' + recentToken.access;
                return axios(originalRequest);
            }
            
            if (isTokenRefreshing) {
                return new Promise(function(resolve, reject){
                    failedQueue.push({resolve, reject});
                }).then(res => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + res.access;
                    return axios(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            originalRequest._retry = true;
            isTokenRefreshing = true;
            
            return new Promise(function (resolve, reject) {
                axios.post(`${baseURL}/token/refresh/`, {
                    refresh: authTokens.refresh
                }).then(res => {
                    //console.log("token reso", res);
                    localStorage.setItem("authTokens", JSON.stringify(res.data));
                    setAuthTokens(res.data);
                    setUser(jwt_decode(res.data.access));
                    processQueue(null, res.data);
                    originalRequest.headers['Authorization'] = 'Bearer ' + res.data.access;
                    resolve(axios(originalRequest));
                    recentToken=res.data;
                }).catch(err => {
                    processQueue(err, null);
                    reject(err);
                }).finally(() => isTokenRefreshing=false);         
            });
        }
        return Promise.reject(error);
    })

    return axiosInstance;
}

export default useAxios;