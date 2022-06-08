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
import TransactForm from '../transaction/TransactForm';
import { AuthProvider } from '../auth/AuthContext';

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

function App() {

  return (
    <Router>
      <div className="app">
        <AuthProvider>
        <Container className="header">
          <NavigBar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="preferences/*" element={<TransactPrefs/>}/>
            <Route path="transactions/*" element={<TransactForm/>}/>
            <Route path="login/*" element={<Login/>}/>
            <Route path="register/*" element={<Register/>}/>
          </Routes>
        </Container>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
