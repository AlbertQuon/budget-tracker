import { useEffect, useState } from 'react';
import '../../css/App.css';
import NavigBar from './NavigBar';
import Home from './Home';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import TransactPrefs from '../transaction/TransactPrefs';

function App() {
  const [transacts, setTransact] = useState(false);


  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="app">
        
        <Container className="header">
          <NavigBar/>
          <h1 className='underline'>Hello123</h1>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="preferences/*" element={<TransactPrefs/>}/>
          </Routes>
        </Container>
        
        
        
      </div>
    </Router>
  );
}

export default App;
