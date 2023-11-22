import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from './config/routes';
import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    element: <App/>,
    children: routes,
  }
]);

root.render(<RouterProvider router={router}/>);
