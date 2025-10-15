import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import DemoResults from './DemoResults';

// Temporarily show demo results - change back to <App /> for full app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DemoResults />
  </React.StrictMode>
);