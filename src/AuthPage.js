import React from "react";
import { Link } from "react-router-dom"
import {
    useIsAuthenticated, 
    useMsal, 
    AuthenticatedTemplate, 
    UnauthenticatedTemplate
  } from "@azure/msal-react";

function AuthPage() {
  const [getStatus, setStatus] = React.useState();

  const { instance, accounts } = useMsal();

  const LogIn = () => {
    let request = {
      scopes: [ "User.Read" ]
    }
    instance.loginPopup(request)
      .catch(e => {
        console.log(e)
        setStatus(e.message)
      })
  }

  const LogOut = () => {
    let request = {
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/",
    }
    instance.logoutPopup(request)
      .catch(e => {
        console.log(e)
        setStatus(e.message)
      })
  }

  const Fetch1 = (token) => {
    let sub = 'd67b705f-d9a4-4cee-881a-3bab1c20e567'
    let rg = 'AMA-skaliki-rg'
    let dcrname = 'AMA-skaliki-dcr'
    let url = 'https://management.azure.com/subscriptions/' + sub + 
      '/resourceGroups/' + rg + 
      '/providers/Microsoft.Insights/dataCollectionRules/' + dcrname + 
      '?api-version=2023-03-11'

    let request = {
      scopes: [ "User.Read" ],
      account: accounts[0],
    }

    instance.acquireTokenSilent(request)
      .then(response => {
        //console.log('[Token]', response)
        setStatus('Got Token')
        return response.accessToken
      })
      .then(token => {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + token)
    
        let options = {
          method: 'GET',
          headers: headers,
        }

        setStatus('Fetching URL')
        return fetch(url, options)
      })
      .then((response) => {
        if (!response.ok) {
          console.log('[Fetch Error]', response.status)
          setStatus(response.status)
          return
        }
        let json = response.json()
        console.log('[Fetch Response]', json)
        setStatus(JSON.stringify(json))
        return response.json()
      })
      .catch(error => {
        console.error(error)
        setStatus(error.message)
      })
  }

  // **********************************

  let items = []

  items.push(<div>
    <div>Status: {getStatus}</div>
  </div>)

  items.push(<div>
    <UnauthenticatedTemplate>
      <a href='#' onClick={LogIn}>LogIn</a>
    </UnauthenticatedTemplate>
  </div>)

items.push(<div>
    <AuthenticatedTemplate>
      <div><a href='#' onClick={Fetch1}>Fetch1</a></div>
      <div><a href='#' onClick={LogOut}>LogOut</a></div>
    </AuthenticatedTemplate>
  </div>)

  items.push(<div className='mt-3'>
    <Link to='/'>Back</Link>
  </div>)

  return (<div>{items}</div>)
}

export default AuthPage;
