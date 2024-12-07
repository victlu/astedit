import React from "react";

function PostDCR(props) {
  const [getStatus, setStatus] = React.useState();
  const [getToken, setToken] = React.useState(props.token);

  const OnSubmit = () => {
    let token = getToken.replaceAll("'", '').replaceAll('"', '').replaceAll(' ', '');

    let url = 'https://management.azure.com' + props.resid + '?api-version=2022-06-01';

    let body = JSON.stringify(props.dcr);

    console.log("POSTING:", body);

    fetch(url, {
      method: "put",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: body
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.error) {
          setStatus(data.error.message);
        }
        else {
          setStatus("OK");
        }
        console.log("Response:", data)
      })
      .catch(err => {
        console.error("fetch", err)
      })
  }

  // ============================================

  let items = [];
  let dialogs = [];

  dialogs.push(
    <div key={dialogs.length}>
      <div className="mb-2">Resource ID: {props.resid}</div>
      <div className="">Access Token: <input value={getToken} size={80} onChange={e => { setToken(e.target.value); }} /></div>
      {getStatus && <div className="mt-4 text-danger">{getStatus}</div>}
    </div>
  )

  dialogs.push(
    <div key={dialogs.length}>
      <hr />
      <div>
        <span className="mx-2"><a href="#" onClick={OnSubmit}>submit</a></span>
      </div>
    </div>);


  items.push(
    <div key={items.length} id="postdcrmodal" className="modal" data-bs-keyboard="false" data-bs-backdrop="static">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Post DCR</h5>
            <span className="btn" data-bs-dismiss="modal" onClick={e => { setStatus(); }}><h5>&times;</h5></span>
          </div>
          <div className="modal-body">
            {dialogs}
          </div>
        </div>
      </div>
    </div>
  );

  items.push(
    <span key={items.length} className="badge cursor-clickable bg-success mx-2"
      data-bs-toggle="modal" data-bs-target="#postdcrmodal">
      {props.children}
    </span>
  );

  return (
    <>{items}</>
  );
}

export default PostDCR;
