import React from 'react';
import './App.css';
import DataSource from './datasources';

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
  const [getTab, setTab] = React.useState();

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
    let extension = null

    dataSources.extensions.forEach(ds => {
      if (ds.extensionName === 'AgentSideTransformExtension') {
        extension = ds
      }
    })
    if (extension === null) {
      extension = {
        name: 'AgentSideTransformExtDataSource',
        extensionName: 'AgentSideTransformExtension',
        streams: [
          'Microsoft-OperationLog'
        ],
        extensionSettings: {
        }
      }
      dataSources.extensions.push(extension)
    }

    let ds = {}

    Object.keys(dataSources).forEach((key) => {
      if (key !== 'extensions') {
        dataSources[key].forEach(dsitem => {
          let id = Object.keys(ds).length + 1
          ds[id] = {
            id: id,
            type: key,
            name: dsitem.name,
            extSettings: null,
          }

          if (!extension.extensionSettings[key]) {
            extension.extensionSettings[key] = []
          }

          let founditem = null;

          // find extensions for this datasource
          extension.extensionSettings[key].forEach(item => {
            if (dsitem.name === item.name) {
              founditem = item
            }
          })

          if (!founditem) {
            founditem = {
              name: dsitem.name,
              streams: [
                'Custom-XXX'
              ]
            }
            extension.extensionSettings[key].push(founditem)
          }

          // Normalize all fields
          if (!founditem.agentTransform) {
            founditem.agentTransform = {}
          }
          if (!founditem.agentTransform.maxBatchTimeoutInSeconds) {
            founditem.agentTransform.maxBatchTimeoutInSeconds = 60
          }
          if (!founditem.agentTransform.maxBatchCount) {
            founditem.agentTransform.maxBatchCount = 1000
          }
          if (!founditem.agentTransform.transform) {
            founditem.agentTransform.transform = {}
          }
          if (!founditem.agentTransform.transform.filters) {
            founditem.agentTransform.transform.filters = []
          }
          if (!founditem.agentTransform.transform.aggregates) {
            founditem.agentTransform.transform.aggregates = {}
          }
          if (!founditem.agentTransform.transform.aggregates.distinct) {
            founditem.agentTransform.transform.aggregates.distinct = []
          }
          if (!founditem.agentTransform.transform.aggregates.avg) {
            founditem.agentTransform.transform.aggregates.avg = []
          }
          if (!founditem.agentTransform.transform.aggregates.sum) {
            founditem.agentTransform.transform.aggregates.sum = []
          }

          ds[id].extSettings = founditem
        })
      }
    })

    return ds
  }

  const SaveFile = () => {
    let extSettings = {}
    Object.values(getDataSource).forEach((item) => {
      if (item.extSettings.agentTransform.transform.filters.length > 0) {
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
        if (!response.ok) {
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
        if (!response.ok) {
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
    let id = getSelectedDataSource
    if (id !== null && getDataSource) {
      let ds = getDataSource[id]

      if (!ds.extSettings) {
        let table = 'Custom-Unknown'
        if (getDcr?.properties?.streamDeclarations) {
          table = Object.keys(getDcr?.properties?.streamDeclarations)[0]
        }

        ds.extSettings = {
          name: ds.name,
          streams: [
            table
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

        ds.extSettings.agentTransform.transform.filters = filters.filters
      }
    }
  }, [getFilter])

  React.useEffect(() => {
    if (!getIdentity) {
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

  if (getIdentity?.clientPrincipal?.userDetails) {
    body.push(<div>
      <span className='badge bg-info mx-2'>{getIdentity.clientPrincipal.userDetails}</span>
      <a href="/.auth/logout" className='mx-2' onClick={FetchAuthMe}>Logout</a>
      <span className='mx-2' onClick={FetchAuthMe}>check</span>
    </div>)
  }
  else {
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

    if (getFilename) {
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
  let fields1 = DataSource[getFields];
  fields1.forEach((o) => {
    field_elem.push(<option>{o.col}</option>);
    field_type[o.col] = o.ty;
    field_desc[o.col] = o.desc;
  });

  let op_elem = [];
  let ops = ["==", "!=", "<", ">", ">=", "<=", "contains"];
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

  let filteroptions = []

  if (getSelectedDataSource && getSelectedDataSource >= 0) {
    let ds = getDataSource[getSelectedDataSource]

    let streamitems = []
    Object.keys(getDcr.properties.streamDeclarations).forEach((item) => {
      if (ds.extSettings?.streams[0] === item) {
        streamitems.push(<option selected>{item}</option>)
      }
      else {
        streamitems.push(<option>{item}</option>)
      }
    })

    filteroptions.push(<div className="container p-2" style={{ backgroundColor: 'lightgrey' }}>
      <div className="mb-1">
        <span>Stream: </span>
        <select onChange={(e) => {
          let ds2 = {
            ...getDataSource
          }
          ds2[getSelectedDataSource].extSettings.streams[0] = e.target.value
          setDataSource(ds2)
        }}>
          {streamitems}
        </select>
      </div>
      <div className="mb-1">
        <span>maxBatchTimeoutInSeconds: </span>
        <input type='text'
          onChange={(e) => {
            let ds2 = {
              ...getDataSource
            }
            ds2[getSelectedDataSource].extSettings.agentTransform.maxBatchTimeoutInSeconds = e.target.value
            setDataSource(ds2)
          }}
          value={ds.extSettings.agentTransform.maxBatchTimeoutInSeconds} />
      </div>
      <div className="mb-1">
        <span>maxBatchCount: </span>
        <input type='text'
          onChange={(e) => {
            let ds2 = {
              ...getDataSource
            }
            ds2[getSelectedDataSource].extSettings.agentTransform.maxBatchCount = e.target.value
            setDataSource(ds2)
          }}
          value={ds.extSettings.agentTransform.maxBatchCount} />
      </div>
    </div>)
  }

  if (getSelectedDataSource && getSelectedDataSource >= 0) {
    let tab = []

    if (!getTab || getTab === 'filter')
    {
      tab.push(<div className='container'>
        <h4>Options</h4>
        <div className="mb-3">
          {filteroptions}
        </div>
        <h4>Groups</h4>
        <div className="mb-3">
          Specify the groups below. Please note: among groups,
          filter applies to any conditions are true (OR logic).
          Within groups, filter applies to all conditions are true (AND logic)
        </div>
        {groups}
        {footer}
      </div>)
    }

    if (getTab === 'aggregation')
    {
      let fields = []

      const ClickBox = (col, agg) => {
        let ds2 = {
          ...getDataSource
        }

        let found = false
        let list = []
        ds2[getSelectedDataSource].extSettings.agentTransform.transform.aggregates[agg].forEach(item => {
          if (item === col)
          {
            found = true
          }
          else
          {
            list.push(item)
          }
        })
        if (!found)
        {
          list.push(col)
        }
        ds2[getSelectedDataSource].extSettings.agentTransform.transform.aggregates[agg] = list

        setDataSource(ds2)
      }

      let headerStyle = {
        fontWeight: 700,
      }

      fields.push(<div className='row'>
        <span className='col col-5' style={headerStyle}>Column name</span>
        <span className='col col-1' style={headerStyle}>Distinct</span>
        <span className='col col-1' style={headerStyle}>Average</span>
        <span className='col col-1' style={headerStyle}>Sum</span>
      </div>)

      let aggs = getDataSource[getSelectedDataSource].extSettings.agentTransform.transform.aggregates
      console.log('[Aggs]', aggs)

      DataSource[getFields].forEach(item => {
        let distinct = ''
        let average = ''
        let sum = ''

        if (item.ty === 'string')
        {
          distinct = 'O'
        }
        else if (item.ty === 'int')
        {
          sum = 'O'
          average = 'O'
        }

        aggs.distinct.forEach(col => {
          if (item.col === col)
          {
            distinct = 'X'
          }
        })
          
        aggs.avg.forEach(col => {
          if (item.col === col)
          {
            average = 'X'
          }
        })

        aggs.sum.forEach(col => {
          if (item.col === col)
          {
            sum = 'X'
          }
        })

        fields.push(<div className='row'>
          <span className='col col-5'>{item.col} ({item.ty})</span>
          <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'distinct')}>{distinct}</span>
          <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'avg')}>{average}</span>
          <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'sum')}>{sum}</span>
        </div>)
      })

      tab.push(<div className='container'>
        {fields}
      </div>)
    }

    body.push(<div>
      <div className='mb-3'>
        <h3>
        <span className={'badge cursor-clickable mx-1 ' + (getTab==='filter'?'bg-primary':'bg-secondary') } onClick={e => { setTab('filter')}}>Filters</span>
        <span className={'badge cursor-clickable mx-1 ' + (getTab==='aggregation'?'bg-primary':'bg-secondary') }onClick={e => { setTab('aggregation')}}>Aggregations</span>
        </h3>
      </div>
      {tab}
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
