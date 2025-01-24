import React from "react";
import './App.css';
import { PasteIcon } from './icons';

function FetchDCR(props) {
  const [getStatus, setStatus] = React.useState();
  const [getToken, setToken] = React.useState('');
  const [getResId, setResId] = React.useState('');
  const [getDCR, setDCR] = React.useState();

  const OnFetch = () => {
    let parts = getResId.replaceAll('"', '').replaceAll(' ', '').split("/");
    console.log("Parts:", parts);

    setDCR();

    if (parts[1] !== "subscriptions" || parts[3] !== "resourceGroups" || parts[7] !== "dataCollectionRules") {
      setStatus("Bad Resource Id");
      return;
    }

    let token = getToken.replaceAll("'", '').replaceAll('"', '').replaceAll(' ', '');

    let url = 'https://management.azure.com' + getResId + '?api-version=2023-03-11';

    fetch(url, {
      headers: {
        Authorization: "Bearer " + token
      }
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
          setDCR(data);
        }
        console.log("Response:", data)
      })
  }

  const OnSubmit = () => {
    console.log("Submit", getDCR);
    if (props.onUpdateDCR) {
      props.onUpdateDCR(getDCR, getResId, getToken);
    }
    setStatus();
    setDCR();
  }

  let items = [];
  let dialogs = [];

  dialogs.push(
    <div key={dialogs.length} className="container">
      <div className="row">
        <span className="col col-2"></span>
        <span className="col col-10">
          <div>1. Goto <b>Azure Portal</b> -&gt; <b>Data Collection Rules</b> pane.</div>
          <div>2. Select your DCR and be on the <b>Overview</b> pane.</div>
          <div>3. Click on "<b>JSON View</b>".</div>
          <div>4. Copy <i>Resource ID</i> to clipboard.</div>
          <div>&nbsp;</div>
          <div>5. Paste <i>Resource ID</i> below.
            <span className="cursor-clickable mx-4"
              onClick={e => {
                navigator.clipboard.readText().then(text => {
                  setResId(text);
                });
              }}>
              <PasteIcon />
            </span>
          </div>
        </span>
      </div>

      <div className="row mb-4">
        <span className="col col-2"><b>Resource Id:</b></span>
        <span className="col col-10">
          <input placeholder="Paste {Resource ID} here." value={getResId} onChange={(e) => { setResId(e.target.value); }} />
        </span>
      </div >

      <div className="row">
        <span className="col col-2"></span>
        <span className="col col-10">
          <div>1. Goto <b>Azure Portal</b> and launch <b>Cloud Shell</b>.</div>
          <div>2. Run... PS&gt; <b>az account get-access-token --query accessToken</b>
            <span className="mx-3"><span
              className="cursor-clickable"
              onClick={e => {
                navigator.clipboard.writeText("az account get-access-token --query accessToken");
              }}>
              <PasteIcon /></span></span>
          </div>
          <div>3. Copy <i>Token</i> to clipboard.</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>- OR -</i></div>
          <div>1. Start Powershell prompt.</div>
          <div>2. Run... PS&gt; <b>az login</b></div>
          <div>3. Run... PS&gt; <b>az account get-access-token --query accessToken | clip</b>
            <span className="mx-3"><span
              className="cursor-clickable"
              onClick={e => {
                navigator.clipboard.writeText("az account get-access-token --query accessToken | clip");
              }}>
              <PasteIcon /></span></span>
          </div>
          <div>&nbsp;</div>
          <div>4. Paste <i>Token</i> below.
            <span className="cursor-clickable mx-4"
              onClick={e => {
                navigator.clipboard.readText().then(text => {
                  setToken(text);
                });
              }}>
              <PasteIcon />
            </span>
          </div>
        </span>
      </div>

      <div className="row">
        <span className="col col-2"><b>Access Token:</b></span>
        <span className="col col-10">
          <input type="password" placeholder="Paste {Token} here." value={getToken} onChange={(e) => { setToken(e.target.value); }} />
          <span className="cursor-clickable mx-3" onClick={e=>{navigator.clipboard.writeText(getToken)}}><PasteIcon/></span>
        </span>
      </div>
    </div>
  );

  if (getStatus) {
    let isOK = getStatus === "OK" ? true : false;

    dialogs.push(
      <div className="container">
        <hr />
        <div className="row">
          <div className="col col-2">
            <b>Fetch Status:</b>
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
        <span className="mx-2"><a href="#" onClick={() => { setStatus(); setResId(''); setToken(''); }}>clear</a></span>
        <span className="mx-2"><span className="badge bg-primary cursor-clickable" onClick={OnFetch}><h6>Fetch</h6></span></span>
        {getDCR && <span className="mx-2" data-bs-dismiss="modal">
          <span className="badge bg-primary cursor-clickable" onClick={OnSubmit}><h6>Close</h6></span>
        </span>}
      </div>
    </div>);

  items.push(
    <div key={items.length} id="fetchdcrmodal" className="modal" data-bs-keyboard="false" data-bs-backdrop="static">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Fetch DCR</h5>
            <span className="btn" data-bs-dismiss="modal" onClick={() => { setStatus(); setDCR(); }}><h5>&times;</h5></span>
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
      data-bs-toggle="modal" data-bs-target="#fetchdcrmodal">
      {props.children}
    </span>
  );

  return (
    <>
      {items}
    </>
  );
}

export default FetchDCR;
