import React from "react";
import './App.css';
import { PasteIcon } from './icons';

function PostDCR(props) {
  const [getStatus, setStatus] = React.useState();
  const [getToken, setToken] = React.useState(props.token);
  const [getResId, setResId] = React.useState(props.resid);

  const OnSubmit = () => {
    let token = getToken.replaceAll("'", '').replaceAll('"', '').replaceAll(' ', '');

    let url = 'https://management.azure.com' + getResId + '?api-version=2022-06-01';

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
      <div className="container">
        <div className="row mb-4">
          <div className="col col-2">
            <b>Resource ID:</b>
          </div>
          <div className="col col-10">
            <input placeholder="Paste {Resource ID} here." value={props.resid} onChange={(e) => { setResId(e.target.value); }} />
          </div>
        </div>
        <div className="row">
          <div className="col col-2"></div>
          <div className="col col-10">
            <div>If <i>Token</i> is expired, Paste new <i>Token</i> below.
              <span className="cursor-clickable mx-4"
                onClick={e => {
                  navigator.clipboard.readText().then(text => {
                    setToken(text);
                  });
                }}>
                <PasteIcon />
              </span>
            </div>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col col-2">
            <b>Access Token:</b>
          </div>
          <div className="col col-10">
            <input type="password" value={getToken} onChange={e => { setToken(e.target.value); }} />
          </div>
        </div>
      </div>
    </div>
  )

  if (getStatus) {
    let isOK = getStatus === "OK" ? true : false;
    dialogs.push(
      <div className="container">
        <hr />
        <div className="row">
          <div className="col col-2">
            <b>Status:</b>
          </div>
          <div className="col col-10">
            <span className={"col col-12" + (isOK ? " text-primary" : " text-danger")}>{getStatus}</span>
          </div>
        </div>
      </div>
    )
  }

  dialogs.push(
    <div key={dialogs.length}>
      <hr />
      <div>
        <span className="mx-2"><span className="badge bg-primary cursor-clickable" onClick={OnSubmit}><h5>Submit</h5></span></span>
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
