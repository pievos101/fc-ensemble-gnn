import React from 'react';
import ReactDOM from 'react-dom/client';
import './react-frontend/index.css';
import App from './react-frontend/App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
