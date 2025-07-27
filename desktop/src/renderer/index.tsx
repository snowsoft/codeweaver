import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

// Create root element
const container = document.getElementById('root');
if (!container) {
    throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(container);

// Render app
root.render(
    <React.StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </React.StrictMode>
);