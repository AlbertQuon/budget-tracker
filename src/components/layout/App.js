import { useEffect, useState } from 'react';
import '../../css/App.css';
import NavigBar from './NavigBar';
import Home from './Home';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import TransactPrefs from '../transaction/TransactPrefs';
import axios from 'axios';
import Login from '../auth/Login';
import Register from '../auth/Register';
import { AuthProvider } from '../auth/AuthContext';
import Budget from '../budget/Budget';
import RequireAuth from "../utils/RequireAuth"
import NoMatch404 from './NoMatch404';
import Transact from '../transaction/Transact';

axios.defaults.xsrfCookieName = 'csrftoken'; 
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

function App() {
 
  return (
    <Router>
      <div className="app">
        <AuthProvider>
        <Container className="header pb-lg-3">
          <NavigBar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="*" element={<NoMatch404/>}/>
            
            <Route path="login/*" element={<Login/>}/>
            <Route path="register/*" element={<Register/>}/>

            <Route path="preferences/*" element={<RequireAuth><TransactPrefs/></RequireAuth>}/>
            <Route path="transactions/*" element={<RequireAuth><Transact/></RequireAuth>}/>
            <Route path="budget/*" element={<RequireAuth><Budget/></RequireAuth>}/> 
            
          </Routes>
        </Container>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
