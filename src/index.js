import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthPage from './AuthPage';

import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
} from "react-router-dom";

import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function ErrorPage() {
  const error = useRouteError();
  return (
    <div>
      <div>Error: {error.statusText || error.message}</div>
      <div><a href='/'>back</a></div>
    </div>
  )
}

const msalConfig = {
  auth: {
    clientId: "e509a28b-423c-4131-bce7-027d44a37375",
    //authority: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47",
    authority: "https://login.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47",
    //authority: "https://login.microsoftonline.com/common/oauth2/authorize",
    redirectUri: "https://agreeable-forest-002f5931e.5.azurestaticapps.net",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      }
    }
  }
}

const msalInstance = new PublicClientApplication(msalConfig);

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
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={router} />
    </MsalProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
