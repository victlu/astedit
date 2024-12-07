import React from "react";
import { Link } from "react-router-dom"

function Auth2Page(props)
{
    const [getStatus, setStatus] = React.useState();

    const Fetch1 = (e) => {
        setStatus('Fetching...')
        fetch('/.auth/me')
        .then(r => {
            return r.json()
        })
        .then((r) => {
            setStatus('[Fetch] Done ' + JSON.stringify(r))
        })
    }

    let items = []

    items.push(<div>Status: {getStatus}</div>)

    items.push(<div>
        <div className='btn btn-info' onClick={Fetch1}>
            Check
        </div>
    </div>)

    items.push(<div><a href='/.auth/login/aad'>LogIn</a></div>)
    items.push(<div><a href='/.auth/logout'>LogOut</a></div>)

    items.push(<div><Link to='/'>Home</Link></div>)

    return <div>{items}</div>
}

export default Auth2Page;
