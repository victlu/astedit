import React from 'react';
import './App.css';
import DataSource from './datasources';
import { CheckIcon, SquareIcon } from './icons';
import { Link } from "react-router-dom";
import FetchDCR from './FetchDCR';
import PostDCR from './PostDCR';

function App() {
  const [getFilename, setFilename] = React.useState();
  const [getFilter, setFilter] = React.useState();
  const [getFields, setFields] = React.useState("blank");
  const [getDcr, setDcr] = React.useState();
  const [getDataSource, setDataSource] = React.useState();
  const [getSelectedDataSource, setSelectedDataSource] = React.useState();
  const [getTab, setTab] = React.useState();
  const [getResId, setResId] = React.useState();
  const [getToken, setToken] = React.useState();

  const clickAddGroup = (e, i) => {
    let filter = [...getFilter]
    let firstfield = DataSource[getFields][0].col
    let obj = [{ field: firstfield, op: "==", value: "" }];
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
    let firstfield = DataSource[getFields][0].col
    filter[i].splice(j + 1, 0, { field: firstfield, op: "==", value: "" });
    setFilter(filter);
  }

  const clickUpdateDataSource = (e, target) => {
    setFields(target);
    setFilter(null);
    //console.log("clickUpdateDataSource", target);
  }

  const clickUpdateItem = (e, i, j, field, op, val) => {
    let filter = [
      ...getFilter
    ]
    if (field) {
      filter[i][j].field = field;
    }
    if (op) {
      filter[i][j].op = op;
    }
    filter[i][j].value = val;

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
    let fields1 = DataSource[getFields]
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

          let ty = null
          fields1.forEach(o => {
            if (o.col === term.field) {
              ty = o.ty
            }
          })

          let v = "\"" + term.value + "\""
          if ((ty === 'int' || ty === 'float') && term.value && term.value.length > 0 && !isNaN(term.value)) {
            v = parseFloat(term.value)
          }

          filterText += "{"
          filterText += "\"field\":\"" + term.field + "\","
          filterText += "\"op\":\"" + term.op + "\","
          filterText += "\"value\":" + v
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

  const HydrateDCR = (dcr) => {
    if (!dcr.properties)
    {
      dcr.properties = {}
    }

    // if (!dcr.properties.streamDeclarations)
    // {
    //   dcr.properties.streamDeclarations = {
    //     "Custom-EmptyTable" : {}
    //   }
    // }

    if (!dcr.properties.dataSources)
    {
      dcr.properties.dataSources = {}
    }

    if (!dcr.properties.dataSources.extensions) {
      dcr.properties.dataSources.extensions = []
    }
  }

  const ParseDCR = (dcr) => {
    HydrateDCR(dcr);

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
            let table = 'Custom-EmptyTable'
            if (dcr?.properties?.streamDeclarations) {
              table = Object.keys(dcr?.properties?.streamDeclarations)[0]
            }
            founditem = {
              name: dsitem.name,
              streams: [
                table
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

  const PrepareOutputDcr = () =>
  {
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

    return dcr;
  }

  const SaveFile = () => {
    let dcr = PrepareOutputDcr()

    let content = JSON.stringify(dcr)
    let blob = new Blob([content], { type: 'application/json' })
    let url = URL.createObjectURL(blob)
    refDownload.current.href = url
    refDownload.current.download = getFilename
    refDownload.current?.click()
    refDownload.current.href = '#'
    URL.revokeObjectURL(url)
  }

  const UpdateDCR = (dcr, resId, token) => {
    setFilter()
    setFilename(dcr.name + ".json")

    let ds = ParseDCR(dcr)
    setDcr(dcr)
    setResId(resId)
    setToken(token)
    setDataSource(ds)
    setSelectedDataSource()
  }

  // **********************************

  React.useEffect(() => {
    let id = getSelectedDataSource
    if (id && id !== null && getDataSource) {
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

  let refDownload = React.useRef()
  let refLoad = React.useRef()

  let filter = getFilter;
  if (!filter) {
    filter = []
    setFilter(filter);
  }

  let body = [];

  // **********************************

  body.push(<div key={body.length}>
    <div className='container'>
      <label htmlFor='pickfile' className="badge cursor-clickable bg-success mx-2">Load DCR File ...</label>
      <input id='pickfile' ref={refLoad} className='hidden' type='file' onChange={(e) => {
        let file = e.target.files[0]
        if (file) {
          let reader = new FileReader()
          reader.onload = (e) => {
            let content = e.target.result
            let dcr = JSON.parse(content)
            let ds = ParseDCR(dcr)
            setDcr(dcr)
            setResId()
            setToken()
            setDataSource(ds)
            setSelectedDataSource()
          }

          setFilter()
          setFilename(file.name)
          reader.readAsText(file)
        }
        refLoad.current.value = null
      }} />

      {getFilename && <span className="badge cursor-clickable bg-success mx-2" onClick={SaveFile}>Save DCR File ...</span>}
      {getFilename && <a href='#' ref={refDownload} className="hidden">Save ...</a>}

      <span><FetchDCR onUpdateDCR={UpdateDCR}>Fetch DCR...</FetchDCR></span>

      {getResId && <PostDCR dcr={PrepareOutputDcr()} resid={getResId} token={getToken}>Post DCR...</PostDCR>}

      {getFilename && <div className="mt-3">File: <b>{getFilename}</b></div>}
    </div>
    <hr />
  </div>)

  if (getDataSource) {
    let items = []

    items.push(<div key={items.length} className="mx-4 mb-2"><h6>Available Data Sources</h6></div>)

    Object.values(getDataSource).forEach((item) => {
      let cs = "badge bg-secondary cursor-clickable mx-1"
      if (getSelectedDataSource === item.id) {
        cs = "badge bg-primary cursor-clickable mx-1"
      }

      items.push(<span key={items.length} className={cs}
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

    body.push(<div key={body.length}>
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
    field_elem.push(<option key={field_elem.length}>{o.col}</option>);
    field_type[o.col] = o.ty;
    field_desc[o.col] = o.desc;
  });

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

      let op_elem = [];
      let ops = ["==", "!=", "<", ">", ">=", "<="];
      for (let o of ops) {
        op_elem.push(<option key={op_elem.length}>{o}</option>);
      }

      if (field_type[rec.field] === 'string') {
        op_elem.push(<option key={op_elem.length}>contains</option>);
      }

      term.push(
        <div key={term.length} className="row">
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
        <div key={term.length} className="row">
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
        <div key={term.length} className="mt-1">
          <span className="link mr-3"
            onClick={e => { clickAddTerm(e, i, j); }}
          >Add more columns</span>
          <span className="link mr-3"
            onClick={e => { clickRemoveTerm(e, i, j); }}
          >Remove this column</span>
        </div>
      )

      fields.push(<div key={fields.length} className="container p-2">
        {term}
      </div>);
    }

    // ********************************

    groups.push(<div key={groups.length} className="mb-2" style={{ fontWeight: 500 }}>
      Group: Filter if all conditions are true in this group (AND logic)
    </div>)

    groups.push(<div key={groups.length} className="container" style={{ backgroundColor: 'lightgrey' }}>
      {fields}
    </div>);

    groups.push(
      <div key={groups.length} className="px-3 mt-1 mb-4">
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
      <div key={footer.length}>
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
    if (getDcr.properties.streamDeclarations)
    {
      Object.keys(getDcr.properties.streamDeclarations).forEach((item) => {
        if (ds.extSettings?.streams[0] === item) {
          streamitems.push(<option key={streamitems.length} selected>{item}</option>)
        }
        else {
          streamitems.push(<option key={streamitems.length}>{item}</option>)
        }
      })
    }
    else
    {
      streamitems.push(<option key={streamitems.length} selected>Custom-EmptyTable</option>)
    }

    filteroptions.push(<div key={filteroptions.length} className="container p-2" style={{ backgroundColor: 'lightgrey' }}>
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

    if (!getTab || getTab === 'filter') {
      tab.push(<div key={tab.length} className='container'>
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

    if (getTab === 'setting') {
      tab.push(<div key={tab.length} className='container'>
        <h4>Filter Settings</h4>
        <div className="mb-3">
          {filter.length === 0 ?
            <p>Need to setup a filter first.</p>
            :
            <>{filteroptions}</>
          }
        </div>
      </div>)
    }

    if (getTab === 'aggregation') {
      let fields = []

      const ClickBox = (col, agg) => {
        let ds2 = {
          ...getDataSource
        }

        let found = false
        let list = []
        ds2[getSelectedDataSource].extSettings.agentTransform.transform.aggregates[agg].forEach(item => {
          if (item === col) {
            found = true
          }
          else {
            list.push(item)
          }
        })
        if (!found) {
          list.push(col)
        }
        ds2[getSelectedDataSource].extSettings.agentTransform.transform.aggregates[agg] = list

        setDataSource(ds2)
      }

      let headerStyle = {
        fontWeight: 700,
      }

      fields.push(<div key={fields.length} className='row'>
        <span className='col col-4' style={headerStyle}>Column name</span>
        <span className='col col-1' style={headerStyle}>Type</span>
        <span className='col col-1' style={headerStyle}>Distinct</span>
        <span className='col col-1' style={headerStyle}>Min</span>
        <span className='col col-1' style={headerStyle}>Max</span>
        <span className='col col-1' style={headerStyle}>Average</span>
        <span className='col col-1' style={headerStyle}>Sum</span>
      </div>)

      let aggs = getDataSource[getSelectedDataSource].extSettings.agentTransform.transform.aggregates

      let terms = ['distinct', 'min', 'max', 'avg', 'sum']
      terms.forEach(term => {
        if (!aggs[term]) {
          aggs[term] = []
        }
      })

      //console.log('[Aggs]', aggs)

      DataSource[getFields].forEach(item => {
        let distinct = null
        let min = null
        let max = null
        let avg = null
        let sum = null

        if (item.ty === 'string') {
          distinct = false
        }
        else if (item.ty === 'int' || item.ty === 'float') {
          min = false
          max = false
          avg = false
          sum = false
        }

        aggs.distinct.forEach(col => {
          if (item.col === col) {
            distinct = true
          }
        })

        aggs.max.forEach(col => {
          if (item.col === col) {
            max = true
          }
        })

        aggs.min.forEach(col => {
          if (item.col === col) {
            min = true
          }
        })

        aggs.avg.forEach(col => {
          if (item.col === col) {
            avg = true
          }
        })

        aggs.sum.forEach(col => {
          if (item.col === col) {
            sum = true
          }
        })

        fields.push(<div key={fields.length} className='row'>
          <span className='col col-4'>{item.col}</span>
          <span className='col col-1'>{item.ty}</span>
          {distinct !== null ? <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'distinct')}>
            {distinct ? CheckIcon() : SquareIcon()}
          </span>
            :
            <span className='col col-1'></span>
          }
          {min !== null ? <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'min')}>
            {min ? CheckIcon() : SquareIcon()}
          </span>
            :
            <span className='col col-1'></span>
          }
          {max !== null ? <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'max')}>
            {max ? CheckIcon() : SquareIcon()}
          </span>
            :
            <span className='col col-1'></span>
          }
          {avg !== null ? <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'avg')}>
            {avg ? CheckIcon() : SquareIcon()}
          </span>
            :
            <span className='col col-1'></span>
          }
          {sum !== null ? <span className='col col-1 cursor-clickable' onClick={() => ClickBox(item.col, 'sum')}>
            {sum ? CheckIcon() : SquareIcon()}
          </span>
            :
            <span className='col col-1'></span>
          }
        </div>)
      })

      tab.push(<div key={tab.length} className='container'>
        {fields}
      </div>)
    }

    body.push(<div key={body.length}>
      <div className='mb-3'>
        <h3>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'filter' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('filter') }}>Filters</span>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'setting' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('setting') }}>Filter Settings</span>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'aggregation' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('aggregation') }}>Aggregations</span>
        </h3>
      </div>
      {tab}
    </div>)
  }

  return (
    <div className="App">
      <header className="App-header">
        <span>
          <span className="fs-2">Agent-Side Transform: Filter Editor</span>
          <Link className='btn btn-link fs-6' to='/auth'>1</Link>
          <Link className='btn btn-link fs-6' to='/auth2'>2</Link>
        </span>
      </header>
      <div className="App-body mt-4">
        {body}
      </div>
    </div>
  );
}

export default App;
