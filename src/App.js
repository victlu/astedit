import React from 'react';
import './App.css';
import DataSource from './datasources';
import { CheckIcon, SquareIcon } from './icons';
import { Link } from "react-router-dom";
import FetchDCR from './FetchDCR';
import PostDCR from './PostDCR';
import ExtendTab from './ExtendTab';
import SelectTab from './SelectTab';
import SettingTab from './SettingTab';
import AggregationTab from './AggregationTab';
import FilterTab from './FilterTab';

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
  const [getSelectFields, setSelectFields] = React.useState({});

  const clickUpdateDataSource = (e, target) => {
    setFields(target);
    setFilter(null);
    //console.log("clickUpdateDataSource", target);
  }

  const clickClipboardPaste = (e) => {
    navigator.clipboard.readText().then(jsonText => {
      clickUpdateJson(e, jsonText);
    });
  }

  const clickUpdateJson = (e, jsonText) => {
    let filter = [];

    try {
      let json = JSON.parse(jsonText);
      json.filter.forEach(o => {
        let terms = [];
        o.forEach(i => {
          terms.push({ field: i.field, operation: i.operation, value: i.value });
        });
        filter.push(terms);
      });

      setFilter(filter);
    }
    catch {
      // Ignore
    }
  }

  const GetFilterJson = (filter) => {
    let filterText = "";
    let fields1 = DataSource[getFields]
    if (filter) {
      let g = 0;
      filterText += "{"
      filterText += "\"filter\":["
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
          filterText += "\"operation\":\"" + term.operation + "\","
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

  const getTransformSection = (kind, transform) => {

    const sortorder = { extend: 0, filter: 1, aggregate: 2, selectFields: 3 };

    let insertIdx = transform.length;

    let ret;
    let idx = 0;
    transform.forEach(t => {
      if (t.kind === kind) {
        ret = t;
      }
      if (sortorder[kind] < sortorder[t.kind]) {
        insertIdx = Math.min(insertIdx, idx);
      }
      idx++;
    });

    if (!ret) {
      ret = {
        kind: kind,
      };
      if (kind === "filter" || kind === "selectFields") {
        ret[kind] = [];
      } else {
        ret[kind] = {};
      }

      transform.splice(insertIdx, 0, ret);
    }

    return ret;
  }

  const ParseDCR = (dcr) => {
    if (!dcr.properties) {
      dcr.properties = {}
    }

    if (!dcr.properties.dataSources) {
      dcr.properties.dataSources = {}
    }

    if (!dcr.properties.dataSources.extensions) {
      dcr.properties.dataSources.extensions = []
    }

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

          if (!extension?.extensionSettings) {
            extension.extensionSettings = [];
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
            }
            extension.extensionSettings[key].push(founditem)
          }

          if (!founditem.streams) {
            founditem.streams = [];
          }

          if (founditem.streams.length === 0) {
            if (dcr?.properties?.streamDeclarations) {
              let tbl = Object.keys(dcr.properties.streamDeclarations)[0];
              if (tbl) {
                founditem.streams.push(tbl);
              }
            }
          }

          //Normalize all fields
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
            founditem.agentTransform.transform = []
          }

          if (Object.prototype.toString.apply(founditem.agentTransform.transform) === '[object Array]') {
            getTransformSection("extend", founditem.agentTransform.transform)
            getTransformSection("filter", founditem.agentTransform.transform)
            getTransformSection("aggregate", founditem.agentTransform.transform)
            getTransformSection("selectFields", founditem.agentTransform.transform)
          }

          ds[id].extSettings = founditem
        })
      }
    })

    return ds
  }

  const PrepareOutputDcr = () => {
    let extSettings = {}
    Object.values(getDataSource).forEach((item) => {
      let ext = JSON.parse(JSON.stringify(item.extSettings));

      // remove empty transform sections...
      let transform = ext.agentTransform.transform;
      let i = 0;
      while (i < transform.length) {
        let isDelete = false;

        if (transform[i].kind === "extend" && Object.keys(transform[i].extend).length === 0) {
          isDelete = true;
        }
        if (transform[i].kind === "filter" && transform[i].filter.length === 0) {
          isDelete = true;
        }
        if (transform[i].kind === "aggregate") {
          if (transform[i]?.aggregate?.groupBy?.length === 0) delete transform[i]?.aggregate?.groupBy;
          if (transform[i]?.aggregate?.max?.length === 0) delete transform[i]?.aggregate?.max;
          if (transform[i]?.aggregate?.min?.length === 0) delete transform[i]?.aggregate?.min;
          if (transform[i]?.aggregate?.avg?.length === 0) delete transform[i]?.aggregate?.avg;
          if (transform[i]?.aggregate?.sum?.length === 0) delete transform[i]?.aggregate?.sum;

          if (Object.keys(transform[i]?.aggregate).length === 0) {
            isDelete = true;
          }
        }
        if (transform[i].kind === "selectFields" && transform[i].selectFields.length === 0) {
          isDelete = true;
        }

        if (isDelete) {
          transform.splice(i, 1);
        }
        else {
          i++;
        }
      }

      if (transform.length === 0) {
        delete ext.agentTransform.transform;
      }

      let hasAST = ext.agentTransform.transform ? true : false;
      if (hasAST) {
        if (!extSettings[item.type]) {
          extSettings[item.type] = []
        }
        extSettings[item.type].push(ext)
      }
    })

    let dcr = JSON.parse(JSON.stringify(getDcr));
    dcr.properties.dataSources.extensions.forEach((item) => {
      if (item.extensionName === 'AgentSideTransformExtension') {
        item.extensionSettings = extSettings
      }
    })

    console.log("[PrepareOutputDcr]", dcr);

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

  const IsValidTransformOrder = (transform) => {
    let kind = [];
    transform.forEach(item => {
      kind.push(item.kind);
    });
    let k = kind.join(",");
    return k === "extend,filter,aggregate,selectFields";
  }

  // **********************************

  React.useEffect(() => {
    let id = getSelectedDataSource
    if (id && id !== null && getDataSource) {
      let ds = getDataSource[id]

      if (!ds.extSettings) {
        ds.extSettings = {
          name: ds.name,
          streams: [],
          agentTransform: {
            maxBatchTimeoutInSeconds: 60,
            maxBatchCount: 1000,
            transform: {}
          }
        }
      }

      if (getFilter) {
        let filterText = GetFilterJson(getFilter)
        let filter = JSON.parse(filterText)

        //ds.extSettings.agentTransform.transform.filter = filter.filter
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

      <span><FetchDCR onUpdateDCR={UpdateDCR}>Fetch DCR...</FetchDCR></span>

      {getFilename && <span className="badge cursor-clickable bg-success mx-2" onClick={SaveFile}>Save DCR File ...</span>}
      {getFilename && <a href='#' ref={refDownload} className="hidden">Save ...</a>}

      {(getFilename && getDataSource) && <PostDCR dcr={PrepareOutputDcr()} resid={getResId} token={getToken}>Post DCR...</PostDCR>}

      {getFilename && <div className="mt-3">{getResId ? "DCR:" : "File:"} <b>{getResId ? getResId : getFilename}</b></div>}
    </div>
    <hr />
  </div>)

  let hasError = false;

  if (getDataSource && (!getDcr?.properties?.streamDeclarations || Object.keys(getDcr.properties.streamDeclarations).length === 0)) {
    body.push(<div className="mb-3">This DCR does not have streamDeclartions defined.</div>)
    body.push(<div>AST requires Custom-Table to be pre-created and declared in DCR via the streamDeclarations section.</div>)
    hasError = true;
  }

  if (!hasError && getDataSource) {
    Object.values(getDataSource).forEach((item) => {
      let ty = Object.prototype.toString.apply(item?.extSettings?.agentTransform?.transform);
      if (ty === '[object Array]') {
        if (!IsValidTransformOrder(item.extSettings.agentTransform.transform)) {
          body.push(<div>DCR has unsupported AST format (order of transform) for <b>{item.name}</b>.</div>);
          hasError = true;
        }
      } else {
        body.push(<div>DCR has incompatible AST format for <b>{item.name}</b>.</div>)
        hasError = true;
      }
    });
  }

  if (!hasError && getDataSource) {
    let items = [];

    items.push(<div key={items.length} className="mx-4 mb-2"><h6>Available Data Sources</h6></div>);

    Object.values(getDataSource).forEach((item) => {
      let cs = "badge bg-secondary cursor-clickable mx-1"
      if (getSelectedDataSource === item.id) {
        cs = "badge bg-primary cursor-clickable mx-1"
      }

      items.push(<span key={items.length} className={cs}
        onClick={(e) => {
          setSelectedDataSource(item.id);
          clickUpdateDataSource(e, item.type);
          let filter = item.extSettings?.agentTransform?.transform?.filter
          if (filter) {
            let text = JSON.stringify({
              filter: filter
            })
            clickUpdateJson(e, text)
          }
        }}
      >
        <div><h6>{item.name}</h6></div>
        <div>({item.type})</div>
      </span>)
    });

    body.push(<div key={body.length}>
      {items}
      <hr />
    </div>);

    // **********************************

    if (getSelectedDataSource && getSelectedDataSource >= 0) {
      let tab = []

      console.log("[App] extSettings:", getDataSource[getSelectedDataSource].extSettings)

      if (!getTab) {
        tab.push(<div key={tab.length} className='container'>
          <div className="mb-3">
            Select a Tab above.
          </div>
        </div>)
      }

      if (getTab === 'setting') {
        let ds2 = getDataSource[getSelectedDataSource].extSettings;
        if (!ds2) {
          ds2 = {};
        }
        tab.push(
          <div key={tab.length} className='container'>
            <SettingTab DataSource={DataSource[getFields]} DcrRoot={getDcr} Dcr={ds2} Update={(dcr) => {
              getDataSource[getSelectedDataSource].extSettings = dcr;
              setDataSource({ ...getDataSource });
            }} />
          </div>);
      }

      if (getTab === 'extend') {
        let ds2 = getTransformSection("extend", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        tab.push(
          <div key={tab.length} className='container'>
            <ExtendTab DataSource={DataSource[getFields]}
              Dcr={ds2.extend}
              Update={(dcr) => {
                let ds2 = getTransformSection("extend", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
                ds2.extend = dcr;
                setDataSource({ ...getDataSource });
              }} />
          </div>);
      }

      if (getTab === 'filter') {
        let extendDcr = getTransformSection("extend", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        let ds2 = getTransformSection("filter", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        tab.push(
          <div key={tab.length} className='container'>
            <FilterTab DataSource={DataSource[getFields]}
              DcrRoot={getDcr}
              ExtendDcr={extendDcr.extend}
              Dcr={ds2.filter}
              Update={(dcr) => {
                let ds2 = getTransformSection("filter", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
                ds2.filter = dcr;
                setDataSource({ ...getDataSource });
              }} />
          </div>);
      }

      if (getTab === 'aggregation') {
        let extendDcr = getTransformSection("extend", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        let ds2 = getTransformSection("aggregate", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        tab.push(
          <div key={tab.length} className='container'>
            <AggregationTab DataSource={DataSource[getFields]}
              ExtendDcr={extendDcr.extend}
              Dcr={ds2.aggregate}
              Update={(dcr) => {
                let ds2 = getTransformSection("aggregate", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
                ds2.aggregate = dcr;
                setDataSource({ ...getDataSource });
              }} />
          </div>);
      }

      if (getTab === 'select') {
        let extendDcr = getTransformSection("extend", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        let aggDcr = getTransformSection("aggregate", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        let ds2 = getTransformSection("selectFields", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
        tab.push(
          <div key={tab.length} className='container'>
            <SelectTab DataSource={DataSource[getFields]}
              DcrRoot={getDcr}
              ExtendDcr={extendDcr.extend}
              AggDcr={aggDcr.aggregate}
              Dcr={ds2.selectFields}
              Update={(dcr) => {
                let ds2 = getTransformSection("selectFields", getDataSource[getSelectedDataSource].extSettings.agentTransform.transform);
                ds2.selectFields = dcr;
                setDataSource({ ...getDataSource });
              }}
            />
          </div>);
      }

      body.push(<div key={body.length}>
        <div className='mb-3'>
          <h3>
            <span className={'badge cursor-clickable mx-1 ' + (getTab === 'setting' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('setting') }}>Settings</span>
            <span className={'badge cursor-clickable mx-1 ' + (getTab === 'extend' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('extend') }}>Extend</span>
            <span className={'badge cursor-clickable mx-1 ' + (getTab === 'filter' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('filter') }}>Filters</span>
            <span className={'badge cursor-clickable mx-1 ' + (getTab === 'aggregation' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('aggregation') }}>Aggregations</span>
            <span className={'badge cursor-clickable mx-1 ' + (getTab === 'select' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('select') }}>Select</span>
          </h3>
        </div>
        {tab}
      </div>)
    }
  }

  // <Link className='btn btn-link fs-6' to='/auth'>1</Link>
  // <Link className='btn btn-link fs-6' to='/auth2'>2</Link>

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <span>Agent-Side Transform: Filter Editor</span>
          <span className="mx-2 fs-6 text-danger">Warning: For testing only. Do not use in Production environment!</span>
        </div>
      </header>
      <div className="App-body mt-4">
        {body}
      </div>
    </div>
  );
}

export default App;
