import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthPage from './AuthPage';

import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
} from "react-router-dom";

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function ErrorPage() {
  const error = useRouteError();
  return (
    <div>
      <div>Error: { error.statusText || error.message }</div>
      <div><a href='/'>back</a></div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: "auth",
    element: <AuthPage />,
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
