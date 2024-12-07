import React from "react";

function FetchDCR(props) {
  const [getStatus, setStatus] = React.useState();
  const [getToken, setToken] = React.useState('');
  const [getResId, setResId] = React.useState('');
  const [getDCR, setDCR] = React.useState();

  const OnFetch = () => {
    let parts = getResId.replaceAll('"','').replaceAll(' ','').split("/");
    console.log("Parts:", parts);

    if (parts[1] !== "subscriptions" || parts[3] !== "resourceGroups" || parts[7] !== "dataCollectionRules")
    {
      setStatus("Bad Resource Id");
      return;
    }

    let token = getToken.replaceAll("'",'').replaceAll('"','').replaceAll(' ','');

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
        if (data.error)
        {
          setStatus(data.error.message);
        }
        else
        {
          setStatus();
        }
        console.log("Response:", data)
        setDCR(data);
      })
  }

  const OnSubmit = () => {
    console.log("Submit", getDCR);
    if (props.onUpdateDCR)
    {
      props.onUpdateDCR(getDCR);
    }
    setDCR();
  }

  let items = [];
  let dialogs = [];

  dialogs.push(
    <div className="container">
      <div className="row mb-4">
        <span className="col col-2"><b>Resource Id:</b></span>
        <span className="col col-10">
          <div>
            Goto Azure Portal | DCR | Overview page<br/>
            Click on "JSON View"<br/>
            Copy "Resource ID" and Paste<br/>
          </div>
          <input value={getResId} size={80} onChange={(e) => { setResId(e.target.value); }}/>
        </span>
      </div>
      <div className="row">
        <span className="col col-2"><b>Access Token:</b></span>
        <span className="col col-10">
          <div>
            PS &gt; <b>az login</b><br/>
            PS &gt; <b>az account get-access-token --query accessToken</b><br/>
            Copy and Paste<br/>
          </div>
          <input value={getToken} size={80} onChange={(e) => { setToken(e.target.value); }}/>
        </span>
      </div>
      { getStatus &&
        <div className="row mt-4">
          <span className="col col-12 text-danger">{getStatus}</span>
        </div>
      }
    </div>);

  dialogs.push(
    <div>
      <hr />
      <div>
        <span className="mx-2"><a href="#" onClick={ () => { setStatus(); setResId(''); setToken(''); }}>clear</a></span>
        <span className="mx-2"><a href="#" onClick={OnFetch}>fetch</a></span>
        { getDCR && <span className="mx-2" data-bs-dismiss="modal"><a href="#" onClick={OnSubmit}>submit</a></span> }
      </div>
    </div>);

  items.push(
    <div id="fetchdcrmodal" className="modal" data-bs-keyboard="false" data-bs-backdrop="static">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
          <h5 className="modal-title">Fetch DCR</h5>
          <span className="btn" data-bs-dismiss="modal" onClick={ () => { setStatus(); setDCR(); }}><h5>&times;</h5></span>
          </div>
          <div className="modal-body">
            {dialogs}
          </div>
        </div>
      </div>
    </div>
  );

  items.push(
    <span className="badge cursor-clickable bg-success mx-2"
      data-bs-toggle="modal" data-bs-target="#fetchdcrmodal">
      Fetch DCR
    </span>
  );

  return (
    <>
      {items}
    </>
  );
}

export default FetchDCR;
