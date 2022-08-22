import axios from "axios";
import jwt_decode from "jwt-decode";
import { useContext } from "react";
import AuthContext from "../auth/AuthContext";

//const baseURL = process.env.baseURL || "http://127.0.0.1:8000/api";
const baseURL = "https://aq-budget-track.herokuapp.com/api";

axios.defaults.xsrfCookieName = 'csrftoken'; 
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const useAxios = () => {
    const {authTokens, setUser, setAuthTokens, logoutUser} = useContext(AuthContext);
    
    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${authTokens?.access}`}
    });
    var recentToken = authTokens;
    /*axiosInstance.interceptors.request.use(async req => {
        //const user = jwt_decode(authTokens.access);
        //const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        //if (!isExpired) return req;

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
        logoutUser();
        return {
            ...req,
            signal: AbortSignal.abort()
        };

        return req;
    }, (error) => {
      return Promise.reject(error);
    });*/

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