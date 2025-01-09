import React from 'react';
import './App.css';

function SettingTab(props) {
  const ReadDcrProps = () => {
    return props.Dcr;
  }

  const SaveDcrProps = (dcr) => {
    props.Update(dcr);
  }

  let sections = [];

  sections.push(
    <div key={sections.length} className="container">
      <h4>Settings</h4>
      <div className="mb-3">
        Settings for Agent-Side Transform.
      </div>
    </div>
  );

  let ds = props.DataSource;

  let streamitems = [];

  let streamDecl = props.DcrRoot.properties.streamDeclarations;
  if (streamDecl) {
    Object.keys(streamDecl).forEach((item) => {
      if (ds.extSettings?.streams[0] === item) {
        streamitems.push(<option key={streamitems.length} selected>{item}</option>)
      }
      else {
        streamitems.push(<option key={streamitems.length}>{item}</option>)
      }
    })
  }
  else {
    streamitems.push(<option key={streamitems.length} selected>Custom-EmptyTable</option>)
  }

  let p = ReadDcrProps();
  if (!p.agentTransform) {
    p.agentTransform = {};
  }

  let rows = [];

  rows.push(<div key={rows.length} className="row mb-3">
    <div className="col col-3 text-start fw-light mb-1">Setting</div>
    <div className="col col-3 text-start fw-light mb-1">Value</div>
    <div className="col text-start fw-light mb-1">Notes</div>
  </div>)

  rows.push(<div key={rows.length} className="row mb-2">
    <div className="col col-3">Stream</div>
    <div className="col col-3">
      <select 
        value={p.streams[0]}
        onChange={(e) => {
        p.streams = [e.target.value];
        SaveDcrProps(p)
      }}>
        {streamitems}
      </select>
    </div>
    <div className="col text-start">
      Stream to an existing Custom Table.
    </div>
  </div>)

  rows.push(<div key={rows.length} className="row mb-2">
    <div className="col col-3">maxBatchCount</div>
    <div className="col col-3">
      <input type='text'
        onChange={(e) => {
          p.agentTransform.maxBatchCount = parseInt(e.target.value);
          SaveDcrProps(p)
        }}
        value={p.agentTransform?.maxBatchCount ? p.agentTransform.maxBatchCount : ""} />
    </div>
    <div className="col text-start">
      Maximum # of events per batch.
    </div>
  </div>)

  rows.push(<div key={rows.length} className="row mb-2">
    <div className="col col-3">maxBatchTimeoutInSeconds</div>
    <div className="col col-3">
      <input type='text'
        onChange={(e) => {
          p.agentTransform.maxBatchTimeoutInSeconds = parseInt(e.target.value);
          SaveDcrProps(p)
        }}
        value={p.agentTransform?.maxBatchTimeoutInSeconds ? p.agentTransform.maxBatchTimeoutInSeconds : ""} />
    </div>
    <div className="col text-start">
      Timeout to wait for a complete batch.
    </div>
  </div>)

  sections.push(<div key={sections.length} className="container p-2" style={{ backgroundColor: 'lightgrey' }}>
    {rows}
  </div>);

  return sections;
}

export default SettingTab;