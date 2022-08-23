import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../auth/AuthContext";

const RequireAuth = ({ children }) => {
    let { user } = useContext(AuthContext);
    let location = useLocation();
    if (!user) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }
    return children;
}

export default RequireAuth;