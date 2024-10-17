import React from 'react';
import './App.css';

function App() {
  const [getCount, setCount] = React.useState(0);
  const [getFilter, setFilter] = React.useState();
  const [getFields, setFields] = React.useState("Windows Events");

  const datasources = {
    "Performance Counters": [
      { col: "CounterName", ty: "string", desc: "e.g. \\Process(taskhostw#1)\\Virtual Bytes" },
      { col: "CounterValue", ty: "float" },
      { col: "SampleRate", ty: "int" },
      { col: "Counter", ty: "string", desc: "e.g. Process\\Virtual Bytes" },
      { col: "Instance", ty: "string" },
    ],
    "Windows Events": [
      { col: "PublisherId", ty: "string" },
      { col: "TimeCreated", ty: "datetime" },
      { col: "PublisherName", ty: "string", desc: "e.g. Microsoft-Windows-Security-Auditing" },
      { col: "Channel", ty: "string" },
      { col: "LoggingComputer", ty: "string" },
      { col: "EventNumber", ty: "int" },
      { col: "EventCategory", ty: "int" },
      { col: "EventLevel", ty: "string" },
      { col: "UserName", ty: "string" },
      { col: "RawXml", ty: "string" },
      { col: "EventDescription", ty: "string" },
      { col: "RenderingInfo", ty: "string" },
      { col: "EventRecordId", ty: "int" },
    ],
    "Custom Logs": [
      { col: "FilePath", ty: "string" },
      { col: "RawData", ty: "string" },
    ],
    "IIS Logs": [
      { col: "s_sitename", ty: "string" },
      { col: "s_computername", ty: "string" },
      { col: "s_ip", ty: "string" },
      { col: "cs_method", ty: "string" },
      { col: "cs_uri_stem", ty: "string" },
      { col: "cs_uri_query", ty: "string" },
      { col: "s_port", ty: "int" },
      { col: "cs_username", ty: "string" },
      { col: "c_ip", ty: "string", desc: "Client IP address" },
      { col: "cs_version", ty: "string" },
      { col: "cs_User_Agent", ty: "string" },
      { col: "cs_Cookie", ty: "string" },
      { col: "cs_Referer", ty: "string" },
      { col: "cs_host", ty: "string" },
      { col: "sc_status", ty: "int" },
      { col: "sc_substatus", ty: "int" },
      { col: "sc_win32_status", ty: "int" },
      { col: "sc_bytes", ty: "int" },
      { col: "cs_bytes", ty: "int" },
      { col: "time_taken", ty: "int" },
    ],
  };

  const clickAddGroup = (e, i) => {
    let filter = getFilter;
    let obj = [ { field: "new", op: "==", value: "new" } ];
    filter.splice(i+1, 0, obj);
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickRemoveGroup = (e, i) => {
    let filter = getFilter;
    filter.splice(i, 1);
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickRemoveTerm = (e, i, j) => {
    let filter = getFilter;
    if (filter[i].length === 1)
    {
      filter.splice(i, 1);
    }
    else
    {
      filter[i].splice(j, 1);
    }
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickAddTerm = (e, i, j) => {
    let filter = getFilter;
    filter[i].splice(j+1, 0, { field: "new", op: "==", value: "new"});
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickUpdateDataSource = (e, target) => {
    setFields(target);
    setFilter(null);
    console.log("clickUpdateDataSource", target);
  }

  const clickUpdateItem = (e, i, j, field, op, val) => {
    let filter = getFilter;
    if (field)
    {
      filter[i][j].field = field;
    }
    if (op)
    {
      filter[i][j].op = op;
    }
    if (val)
    {
      filter[i][j].value = val;
    }
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickUpdateJson = (e, jsonText) =>
  {
    let filter = [];

    try
    {
      let json = JSON.parse(jsonText);
      json.filters.forEach( o => {
        let terms = [];
        o.forEach( i => {
          terms.push({ field: i.field, op: i.op, value: i.value });
        });
        filter.push(terms);
      });
  
      setFilter(filter);
      setCount(getCount+1);
    }
    catch
    {
      // Ignore
    }
  }

  const clickClipboardPaste = (e) =>
  {
    navigator.clipboard.readText().then( jsonText => {
      clickUpdateJson(e, jsonText);
    });
  }

  const GetFilterJson = (filter) => {
    let filterText = "";
    if (filter)
    {
      let g = 0;
      filterText += "{"
      filterText += "\"filters\":["
      for (let group of filter)
      {
        if (g > 0)
        {
          filterText += ","
        }
        filterText += "["
  
        let t = 0;
        for (let term of group)
        {
          if (t > 0)
          {
            filterText += ","
          }
          filterText += "{"
          filterText += "\"field\":\"" + term.field + "\","
          filterText += "\"op\":\"" + term.op + "\","
          filterText += "\"value\":\"" + term.value + "\""
          filterText += "}"
          t++;
        }
        filterText += "]"
        g++;
      }
      filterText += "]}"
    }
    return filterText
  }

  // **********************************

  let refDownload = React.useRef()

  let filter = getFilter;
  if (!filter)
  {
    filter = []
    setFilter(filter);
  }

  let body = [];

  // **********************************

  body.push(<div>
    <div className='container'>
      <label for='pickfile' className="badge cursor-clickable bg-success mx-2">Load ...</label>
      <input id='pickfile' className='hidden' type='file' onChange={(e) => {
        let file = e.target.files[0]
        if (file)
        {
          let reader = new FileReader()
          reader.onload = (e) => {
            let content = e.target.result
            clickUpdateJson(null, content)
          }

          reader.readAsText(file)
        }
      }}/>

      <span className="badge cursor-clickable bg-success mx-2" onClick={() => {
        let content = GetFilterJson(getFilter)
        let blob = new Blob([content], { type: 'application/json'})
        let url = URL.createObjectURL(blob)
        refDownload.current.href = url
        refDownload.current?.click()
        refDownload.current.href = '#'
        URL.revokeObjectURL(url)
      }}>Save ...</span>

      <a href='#' ref={refDownload} className="hidden" download='filter.json'>Save ...</a>
    </div>
    <hr />
  </div>)

  // **********************************
  // Select DataSouces

  let ds = [];
  Object.keys(datasources).forEach((o) => {
    ds.push(<option value={o}>{o}</option>)
  })

  body.push(<div className="container mb-3">
    <div className="col">
      Data Source:
    </div>
    <div className="col col-5">
      <select className="form-select"
        value={getFields}
        onChange={e => { clickUpdateDataSource(e, e.target.value)}}>
        {ds}
      </select>
    </div>
  </div>);

  // **********************************

  let field_elem = [];
  let field_type = {};
  let field_desc = {};
  let fields1 = datasources[getFields];
  fields1.forEach((o) => {
    field_elem.push(<option>{o.col}</option>);
    field_type[o.col] = o.ty;
    field_desc[o.col] = o.desc;
  });

  let op_elem = [];
  let ops = ["==", "!=", "<", ">"];
  for (let o of ops)
  {
    op_elem.push(<option>{o}</option>);
  }

  // Filter Groups
  let groups = [];
  for (let i = 0; i < filter.length; i++)
  {
    let fields = [];

    // Filter Terms
    for (let j = 0; j < filter[i].length; j++)
    {
      let rec = filter[i][j];
      let term = [];

      let desc = null;
      if (field_desc[rec.field])
      {
        desc= <span>{field_desc[rec.field]}</span>
      }

      term.push(
        <div className="row">
          <div className="col col-5 text-start fw-light mb-1">
            Field:
          </div>
          <div className="col col-2 text-start fw-light mb-1">
            Operation:
          </div>
          <div className="col col-5 text-start fw-light mb-1">
            Value: [{field_type[rec.field]}] {desc}
          </div>
        </div>);

      term.push(
        <div className="row">
          <div className="col col-5">
            <select className="form-select"
              value={rec.field}
              onChange={e => { clickUpdateItem(e, i, j, e.target.value, null, null)}}>
              {field_elem}
            </select>
          </div>
          <div className="col col-2">
            <select className="form-select"
              value={rec.op}
              onChange={e => { clickUpdateItem(e, i, j, null, e.target.value, null)}}>
              {op_elem}
            </select>
          </div>
          <div className="col col-5">
            <input
                className="form-control"
                value={rec.value}
                onChange={e => { clickUpdateItem(e, i, j, null, null, e.target.value)}}
                />
          </div>
        </div>);

      term.push(
        <div className="row">
          <div className="col-10">
          </div>
          <div className="col col-2 mt-2">
            <span className="badge bg-success cursor-clickable mr-1"
              onClick={ e => { clickAddTerm(e, i, j);}}
              >+</span>
            <span className="badge bg-danger cursor-clickable"
              onClick={ e => { clickRemoveTerm(e, i, j);}}
              >-</span>
          </div>
        </div>
      )

      if (j > 0)
      {
        fields.push(<div className="row mb-3">
          <div className="col fw-light">
            <span className="badge rounded-pill bg-info">and</span>
          </div>
        </div>);
      }

      fields.push(<div className="container p-2 mb-3 bg-secondary">
        {term}
        </div>);
    }

    let field_ctrl = [];
    field_ctrl.push(
      <div className="container p-0">
        <div className="row">
          <div className="col col-11">
          </div>
          <div className="col col-1">
            <div className="badge bg-success cursor-clickable mr-1"
              onClick={e => { clickAddGroup(e, i); }}
            >+</div>
            <div className="badge bg-danger cursor-clickable"
              onClick={e => { clickRemoveGroup(e, i); }}
            >-</div>
          </div>
        </div>
      </div>);

    if (i > 0)
    {
      groups.push(<div className="container mb-3">
        <div className="row">
          <div className="col text-center fw-light">
            <span className="badge rounded-pill bg-info">or</span>
          </div>
        </div>
      </div>);
    }

    groups.push(<div className="row">
      <div className="row badge bg-secondary mr-1 mb-3 pt-3 pb-3">
        {fields}
        <hr/>
        {field_ctrl}
      </div>
      </div>);
  }

  let footer = [];

  if (filter.length === 0)
  {
    footer.push(
      <div>
      <span 
      className="badge bg-success cursor-clickable mr-1"
      onClick={ e => { clickAddGroup(e, -1);}}
      >+</span>
      </div>
    );
  }

  body.push(<div className="container">
    <hr/>
    Filters:
    {groups}
    {footer}
  </div>)

  // **********************************
  // Generate JSON

  let filterText = GetFilterJson(getFilter)

  body.push(<div className="container">
    <hr/>
    JSON snippet:
    <div className="container">
      <input
        className="form-control"
        value={filterText}
        onChange={e => { clickUpdateJson(e, e.target.value); }}
        />
    </div>
    <div className="badge cursor-clickable bg-success mr-1"
      onClick={ e => {navigator.clipboard.writeText(filterText); alert("Json text copied to clipboard."); }}
      >Copy to Clipboard</div>
    <div className="badge cursor-clickable bg-success"
      onClick={clickClipboardPaste}
      >Paste from Clipboard</div>
  </div>);

  return (
    <div className="App">
      <header className="App-header">
        <p>Agent-Side Transform: Filter Editor</p>
      </header>
      <div className="App-body mt-4">
        {body}
      </div>
    </div>
  );
}

export default App;
