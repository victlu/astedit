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
  const [getAPI, setAPI] = React.useState('User.Read');

  const { instance, accounts } = useMsal();

  const LogIn = () => {
    let request = {
      scopes: getAPI ? [getAPI] : []
    }
    instance.loginPopup(request)
      .then(r => {
        setStatus("Successful Login")
      })
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
      .then(r => {
        setStatus("Successful Logout")
      })
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
      scopes: getAPI ? [getAPI] : [],
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
          console.log('[Fetch Error]', response)
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
    <hr />
  </div>)

  items.push(<div>
    <div>API Scope: <input type='text' value={getAPI ? getAPI : '[Blank]' } onChange={(e) => setAPI(e.target.value)} /></div>
    <div>
      <span className='me-2'><a href='#' onClick={() => { setAPI() }}>[Blank]</a></span>
      <span className='me-2'><a href='#' onClick={() => { setAPI('User.Read') }}>User.Read</a></span>
      <span className='me-2'><a href='#' onClick={() => { setAPI('.default') }}>.default</a></span>
      <span className='me-2'><a href='#' onClick={() => { setAPI('https://management.azure.com/user_impersonation') }}>user_impersonation</a></span>
    </div>
    <hr />
  </div>)

  items.push(<div>
    <UnauthenticatedTemplate>
      <a href='#' onClick={LogIn}>LogIn</a>
    </UnauthenticatedTemplate>
  </div>)

  items.push(<div>
    <AuthenticatedTemplate>
      <div><a href='#' onClick={LogOut}>LogOut</a></div>
      <div>&nbsp;</div>
      <div><a href='#' onClick={Fetch1}>Fetch1</a></div>
    </AuthenticatedTemplate>
  </div>)

  items.push(<div className='mt-3'>
    <Link to='/'>Back</Link>
  </div>)

  return (<div>{items}</div>)
}

export default AuthPage;
