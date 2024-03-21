import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from './config/routes';
import { Provider } from "react-redux";
import store from "./store";
import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    element: <Provider store={store}>
      <App />
    </Provider>,
    children: routes,
  }
]);

root.render(<RouterProvider router={router}/>);
