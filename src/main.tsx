
import React from 'react';
import ReactDOM from 'react-dom/client';
import WebApp from './WebApp';
import './index.css';

console.log('Starting GoodDeeds VPN Web App...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebApp />
  </React.StrictMode>
);
