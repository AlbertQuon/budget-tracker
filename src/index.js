import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import "react-datepicker/dist/react-datepicker.css";
import App from './components/layout/App'; // make sure this is last so bootstrap loads first

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


