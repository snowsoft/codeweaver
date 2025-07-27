// src/App.tsx
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "./components/layout/MainLayout";

function App() {
    return (
        <BrowserRouter>
            <MainLayout />
            <Toaster position="bottom-right" />
        </BrowserRouter>
    );
}

export default App;