// src/App.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./views/Dashboard";
import Generate from "./views/Generate";
import Refactor from "./views/Refactor";
import Document from "./views/Document";
import Test from "./views/Test";
import Review from "./views/Review";
import History from "./views/History";
import Settings from "./views/Settings";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "generate", element: <Generate /> },
            { path: "refactor", element: <Refactor /> },
            { path: "document", element: <Document /> },
            { path: "test", element: <Test /> },
            { path: "review", element: <Review /> },
            { path: "history", element: <History /> },
            { path: "settings", element: <Settings /> },
        ],
    },
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
});

function App() {
    return <RouterProvider router={router} />;
}

export default App;