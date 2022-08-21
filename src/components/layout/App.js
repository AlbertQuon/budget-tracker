import { useEffect, useState } from 'react';
import '../../css/App.css';
import NavigBar from './NavigBar';
import Home from './Home';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import TransactPrefs from '../budget/TransactPrefs';
import axios from 'axios';
import Login from '../auth/Login';
import Register from '../auth/Register';
import { AuthProvider } from '../auth/AuthContext';
import Budget from '../budget/Budget';
import RequireAuth from "../utils/RequireAuth"
import NoMatch404 from './NoMatch404';
import Transact from '../transaction/Transact';
import VerifyAuth from '../utils/VerifyAuth';
import UserSettings from '../auth/UserSettings';

axios.defaults.xsrfCookieName = 'csrftoken'; 
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

function App() {
 
  return (
    <Router>
      <div className="app">
        <AuthProvider>
        <Container className="header pb-lg-4">
          <NavigBar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="*" element={<NoMatch404/>}/>
            
            <Route path="login/*" element={<VerifyAuth><Login/></VerifyAuth>}/>
            <Route path="register/*" element={<VerifyAuth><Register/></VerifyAuth>}/>
            
            <Route path="settings/*" element={<RequireAuth><UserSettings/></RequireAuth>}/>
            <Route path="budget/*" element={<RequireAuth><Budget/></RequireAuth>}/> 
            <Route path="transactions/*" element={<RequireAuth><Transact/></RequireAuth>}/>
          </Routes>
        </Container>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
