import React from 'react';
import './App.css';

//GET https://management.azure.com/subscriptions/d67b705f-d9a4-4cee-881a-3bab1c20e567/resourceGroups/AMA-skaliki-rg/providers/Microsoft.Insights/dataCollectionRules/AMA-skaliki-dcr?api-version=2023-03-11
//Authorization: Bearer XXXXXXXX

function App() {
  const [getFilename, setFilename] = React.useState();
  const [getFilter, setFilter] = React.useState();
  const [getFields, setFields] = React.useState("blank");
  const [getDcr, setDcr] = React.useState();
  const [getDataSource, setDataSource] = React.useState();
  const [getSelectedDataSource, setSelectedDataSource] = React.useState();
  const [getIdentity, setIdentity] = React.useState();

  const datasources = {
    "blank": [
    ],
    "performanceCounters": [
      { col: "CounterName", ty: "string", desc: "e.g. \\Process(taskhostw#1)\\Virtual Bytes" },
      { col: "CounterValue", ty: "float" },
      { col: "SampleRate", ty: "int" },
      { col: "Counter", ty: "string", desc: "e.g. Process\\Virtual Bytes" },
      { col: "Instance", ty: "string" },
    ],
    "windowsEventLogs": [
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
    "customLogs": [
      { col: "FilePath", ty: "string" },
      { col: "RawData", ty: "string" },
    ],
    "iisLogs": [
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
    let filter = [...getFilter]
    let obj = [{ field: "new", op: "==", value: "new" }];
    filter.splice(i + 1, 0, obj);
    setFilter(filter);
  }

  const clickRemoveGroup = (e, i) => {
    let filter = [...getFilter]
    filter.splice(i, 1);
    setFilter(filter);
  }

  const clickRemoveTerm = (e, i, j) => {
    let filter = [...getFilter]
    if (filter[i].length === 1) {
      filter.splice(i, 1);
    }
    else {
      filter[i].splice(j, 1);
    }
    setFilter(filter);
  }

  const clickAddTerm = (e, i, j) => {
    let filter = [...getFilter]
    filter[i].splice(j + 1, 0, { field: "new", op: "==", value: "new" });
    setFilter(filter);
  }

  const clickUpdateDataSource = (e, target) => {
    setFields(target);
    setFilter(null);
    console.log("clickUpdateDataSource", target);
  }

  const clickUpdateItem = (e, i, j, field, op, val) => {
    let filter = [...getFilter]
    if (field) {
      filter[i][j].field = field;
    }
    if (op) {
      filter[i][j].op = op;
    }
    if (val) {
      filter[i][j].value = val;
    }
    setFilter(filter);
  }

  const clickUpdateJson = (e, jsonText) => {
    let filter = [];

    try {
      let json = JSON.parse(jsonText);
      json.filters.forEach(o => {
        let terms = [];
        o.forEach(i => {
          terms.push({ field: i.field, op: i.op, value: i.value });
        });
        filter.push(terms);
      });

      setFilter(filter);
    }
    catch {
      // Ignore
    }
  }

  const clickClipboardPaste = (e) => {
    navigator.clipboard.readText().then(jsonText => {
      clickUpdateJson(e, jsonText);
    });
  }

  const GetFilterJson = (filter) => {
    let filterText = "";
    if (filter) {
      let g = 0;
      filterText += "{"
      filterText += "\"filters\":["
      for (let group of filter) {
        if (g > 0) {
          filterText += ","
        }
        filterText += "["

        let t = 0;
        for (let term of group) {
          if (t > 0) {
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

  const ParseDCR = (dcr) => {
    let dataSources = dcr.properties.dataSources
    let extSettings = null

    let ds = {}

    Object.keys(dataSources).forEach((key) => {
      if (key !== 'extensions') {
        dataSources[key].forEach(item => {
          let id = Object.keys(ds).length + 1
          ds[id] = {
            id: id,
            type: key,
            name: item.name,
            extSettings: null,
          }
        })
      }
    })

    dataSources.extensions.forEach((key) => {
      if (key.extensionName === 'AgentSideTransformExtension') {
        Object.keys(key.extensionSettings).forEach(itemType => {
          key.extensionSettings[itemType].forEach(item => {
            Object.values(ds).forEach(ds1 => {
              if (ds1.name === item.name && ds1.type === itemType) {
                ds1.extSettings = item
              }
            })
          })
        })
      }
    })

    return ds
  }

  const SaveFile = () => {
    let extSettings = {}
    Object.values(getDataSource).forEach((item) => {
      if (item.extSettings.agentTransform.transform.filters.length > 0)
      {
        if (!extSettings[item.type]) {
          extSettings[item.type] = []
        }
        extSettings[item.type].push(item.extSettings)
      }
    })

    let dcr = getDcr
    dcr.properties.dataSources.extensions.forEach((item) => {
      if (item.extensionName === 'AgentSideTransformExtension') {
        item.extensionSettings = extSettings
      }
    })

    let content = JSON.stringify(dcr)
    let blob = new Blob([content], { type: 'application/json' })
    let url = URL.createObjectURL(blob)
    refDownload.current.href = url
    refDownload.current.download = getFilename
    refDownload.current?.click()
    refDownload.current.href = '#'
    URL.revokeObjectURL(url)
  }

  const Fetch1 = () => {
    let url = 'https://management.azure.com/subscriptions/d67b705f-d9a4-4cee-881a-3bab1c20e567/resourceGroups/AMA-skaliki-rg/providers/Microsoft.Insights/dataCollectionRules/AMA-skaliki-dcr?api-version=2023-03-11'
    fetch(url)
      .then((response) => {
        if (!response.ok)
        {
          console.log('[Fetch Error]', response.status)
          return
        }
        let json = response.json()
        console.log('[Fetch Response]', json)
        return response.json()
      })
      .catch(error => {
        console.error(error)
      })
  }

  const Fetch2 = () => {
    let url = 'https://login.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47'
    fetch(url)
      .then((response) => {
        if (!response.ok)
        {
          console.log('[Fetch Error]', response.status)
          return
        }
        let json = response.json()
        console.log('[Fetch Response]', json)
        return response.json()
      })
      .catch(error => {
        console.error(error)
      })
  }
  

  const FetchAuthMe = () => {
    let url = '/.auth/me'
    fetch(url)
      .then((response) => {
        if (!response.ok)
        {
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
    let id = getSelectedDataSource
    if (id !== null && getDataSource) {
      let ds = getDataSource[id]

      if (!ds.extSettings) {
        ds.extSettings = {
          name: ds.name,
          streams: [
            'Custom-XXX'
          ],
          agentTransform: {
            maxBatchTimeoutInSeconds: 60,
            maxBatchCount: 1000,
            transform: {}
          }
        }
      }

      if (getFilter) {
        let filterText = GetFilterJson(getFilter)
        let filters = JSON.parse(filterText)

        console.log('[ExtSettings]', ds.extSettings.agentTransform.transform.filters, filters.filters)

        ds.extSettings.agentTransform.transform.filters = filters.filters
      }
    }
  }, [getFilter])

  React.useEffect(() => {
    if (!getIdentity)
    {
      FetchAuthMe()
    }
  }, [getIdentity])

  let refDownload = React.useRef()
  let refLoad = React.useRef()

  let filter = getFilter;
  if (!filter) {
    filter = []
    setFilter(filter);
  }

  let body = [];

  // **********************************

  if (getIdentity?.clientPrincipal?.userDetails)
  {
    body.push(<div>
      <span className='badge bg-info mx-2'>{getIdentity.clientPrincipal.userDetails}</span>
      <a href="/.auth/logout" className='mx-2' onClick={FetchAuthMe}>Logout</a>
      <span className='mx-2' onClick={FetchAuthMe}>check</span>
    </div>)
  }
  else
  {
    body.push(<div>
      <a href="/.auth/login/aad" className='mx-2' onClick={FetchAuthMe}>Login</a>
      <span className='mx-2' onClick={FetchAuthMe}>check</span>
    </div>)
  }

  body.push(
    <div>
      <span className='mx-2' onClick={Fetch1}>fetch1</span>
      <span className='mx-2' onClick={Fetch2}>fetch2</span>
    </div>
  )


  body.push(<div>
    <div className='container'>
      <label for='pickfile' className="badge cursor-clickable bg-success mx-2">Load ...</label>
      <input id='pickfile' ref={refLoad} className='hidden' type='file' onChange={(e) => {
        let file = e.target.files[0]
        if (file) {
          let reader = new FileReader()
          reader.onload = (e) => {
            let content = e.target.result
            let dcr = JSON.parse(content)
            let ds = ParseDCR(dcr)
            setDcr(dcr)
            setDataSource(ds)
            setSelectedDataSource()
          }

          setFilter()
          setFilename(file.name)
          reader.readAsText(file)
        }
        refLoad.current.value = null
      }} />

      {getFilename && <span className="badge cursor-clickable bg-success mx-2" onClick={SaveFile}>Save ...</span>}
      {getFilename && <a href='#' ref={refDownload} className="hidden">Save ...</a>}
    </div>
    <hr />
  </div>)

  if (getDataSource) {
    let items = []

    if (getFilename)
    {
      items.push(<div className="mx-4 mb-2">File: {getFilename}</div>)
    }

    Object.values(getDataSource).forEach((item) => {
      let cs = "badge bg-secondary cursor-clickable mx-1"
      if (getSelectedDataSource === item.id) {
        cs = "badge bg-primary cursor-clickable mx-1"
      }

      items.push(<span className={cs}
        onClick={(e) => {
          setSelectedDataSource(item.id);
          clickUpdateDataSource(e, item.type);
          let filters = item.extSettings?.agentTransform?.transform?.filters
          if (filters) {
            let text = JSON.stringify({
              filters: filters
            })
            clickUpdateJson(e, text)
          }
        }}
      >
        {item.name}
        <br />
        ({item.type})
      </span>)
    })

    body.push(<div>
      {items}
      <hr />
    </div>)
  }

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
  let ops = [ "==", "!=", "<", ">", ">=", "<=", "contains" ];
  for (let o of ops) {
    op_elem.push(<option>{o}</option>);
  }

  // Filter Groups
  let groups = [];
  for (let i = 0; i < filter.length; i++) {
    let fields = [];

    // Filter Terms
    for (let j = 0; j < filter[i].length; j++) {
      let rec = filter[i][j];
      let term = [];

      let desc = null;
      if (field_desc[rec.field]) {
        desc = <span>{field_desc[rec.field]}</span>
      }

      term.push(
        <div className="row">
          <div className="col col-5 text-start fw-light mb-1">
            Column name
          </div>
          <div className="col col-2 text-start fw-light mb-1">
            Operator
          </div>
          <div className="col col-5 text-start fw-light mb-1">
            Column value [{field_type[rec.field]}] {desc}
          </div>
        </div>);

      term.push(
        <div className="row">
          <div className="col col-5">
            <select className="form-select"
              value={rec.field}
              onChange={e => { clickUpdateItem(e, i, j, e.target.value, null, null) }}>
              {field_elem}
            </select>
          </div>
          <div className="col col-2">
            <select className="form-select"
              value={rec.op}
              onChange={e => { clickUpdateItem(e, i, j, null, e.target.value, null) }}>
              {op_elem}
            </select>
          </div>
          <div className="col col-5">
            <input
              className="form-control"
              value={rec.value}
              onChange={e => { clickUpdateItem(e, i, j, null, null, e.target.value) }}
            />
          </div>
        </div>);

      term.push(
        <div className="mt-1">
          <span className="link mr-3"
            onClick={e => { clickAddTerm(e, i, j); }}
          >Add more columns</span>
          <span className="link mr-3"
            onClick={e => { clickRemoveTerm(e, i, j); }}
          >Remove this column</span>
        </div>
      )

      fields.push(<div className="container p-2">
        {term}
      </div>);
    }

    // ********************************

    groups.push(<div className="mb-2" style={{ fontWeight: 500 }}>
      Group: Filter if all conditions are true in this group (AND logic)
    </div>)

    groups.push(<div className="container" style={{ backgroundColor: 'lightgrey' }}>
      {fields}
    </div>);

    groups.push(
      <div className="px-3 mt-1 mb-4">
        <span className="link mr-3"
          onClick={e => { clickAddGroup(e, i); }}
        >Add more groups</span>
        <span className="link"
          onClick={e => { clickRemoveGroup(e, i); }}
        >Remove this group</span>
      </div>);
  }

  let footer = [];

  if (filter.length === 0) {
    footer.push(
      <div>
        <span
          className="link mr-1"
          onClick={e => { clickAddGroup(e, -1); }}
        >Add more groups</span>
      </div>
    );
  }

  if (getSelectedDataSource && getSelectedDataSource >= 0)
  {
    body.push(<div className="container">
      <h3>Filters</h3>
      <div className="mb-3">
        Specify the groups below. Please note: among groups, 
        filter applies to any conditions are true (OR logic).
        Within groups, filter applies to all conditions are true (AND logic)
      </div>
      {groups}
      {footer}
    </div>)
  }

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
