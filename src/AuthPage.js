import React from "react";
import { Link } from "react-router-dom"

function AuthPage() {
  const [getIdentity, setIdentity] = React.useState();
  const [getStatus, setStatus] = React.useState();

  const Fetch1 = () => {
    let url = 'https://management.azure.com/subscriptions/d67b705f-d9a4-4cee-881a-3bab1c20e567/resourceGroups/AMA-skaliki-rg/providers/Microsoft.Insights/dataCollectionRules/AMA-skaliki-dcr?api-version=2023-03-11'
    fetch(url)
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

  const Fetch2 = () => {
    let url = 'https://login.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47'
    fetch(url)
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

  const FetchAuthMe = () => {
    let url = '/.auth/me'
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          console.log('[Fetch Error]', response.status)
          return
        }
        return response.json();
      })
      .then(data => {
        console.log('[Fetch Response]', data)
        setIdentity(data)
        return data
      })
      .catch(error => {
        console.error('[Fetch Error]', error)
      })
  }

  // **********************************

  React.useEffect(() => {
    if (!getIdentity) {
      FetchAuthMe()
    }
  }, [getIdentity])

  let items = []

  items.push(<div>Auth Page</div>)
  items.push(<div>Identity: {getIdentity?.clientPrincipal?.userDetails}</div>)
  items.push(<div>
    <a href='#' onClick={FetchAuthMe}>AuthMe</a>
  </div>)
  items.push(<div>
    <a href="/.auth/login/aad">Login</a>
  </div>)
  items.push(<div>
    <a href="/.auth/logout">Logout</a>
  </div>)

  items.push(<div className='mt-3'>
    <div>Status: {getStatus}</div>
    <a href='#' className='me-1' onClick={Fetch1}>fetch1</a>
    <a href='#' className='me-1' onClick={Fetch2}>fetch2</a>
  </div>)

  items.push(<div className='mt-3'>
    <Link to='/'>Back</Link>
  </div>)

  return (<div>{items}</div>)
}

export default AuthPage;
