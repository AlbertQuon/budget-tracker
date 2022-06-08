import { Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../auth/AuthContext";

const PrivateRoute= ({ children, ...rest }) => {
    let { user } = useContext(AuthContext);
    return ( <Route {...rest}>{!user ? <Navigate to="/" state={{from:location}} replace/> : children}</Route> );
}

export default PrivateRoute;