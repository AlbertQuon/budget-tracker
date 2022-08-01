import { Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../auth/AuthContext";

const VerifyAuth = ({ children }) => {
    let { user } = useContext(AuthContext);
    let location = useLocation();
    if (user) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }
    return children;
}

export default VerifyAuth;