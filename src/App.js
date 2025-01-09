import React from 'react';
import './App.css';
import DataSource from './datasources';
import { CheckIcon, SquareIcon } from './icons';
import { Link } from "react-router-dom";
import FetchDCR from './FetchDCR';
import PostDCR from './PostDCR';
import ParseTab from './ParseTab';
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
            founditem.agentTransform.transform = {}
          }
          if (!founditem.agentTransform.transform.filters) {
            founditem.agentTransform.transform.filters = []
          }
          if (!founditem.agentTransform.transform.aggregates) {
            founditem.agentTransform.transform.aggregates = {}
          }
          // if (!founditem.agentTransform.transform.aggregates.distinct) {
          //   founditem.agentTransform.transform.aggregates.distinct = []
          // }
          // if (!founditem.agentTransform.transform.aggregates.avg) {
          //   founditem.agentTransform.transform.aggregates.avg = []
          // }
          // if (!founditem.agentTransform.transform.aggregates.sum) {
          //   founditem.agentTransform.transform.aggregates.sum = []
          // }

          ds[id].extSettings = founditem
        })
      }
    })

    return ds
  }

  const PrepareOutputDcr = () => {
    let extSettings = {}
    Object.values(getDataSource).forEach((item) => {
      if (!extSettings[item.type]) {
        extSettings[item.type] = []
      }
      extSettings[item.type].push(item.extSettings)
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
          let filters = item.extSettings?.agentTransform?.transform?.filters
          if (filters) {
            let text = JSON.stringify({
              filters: filters
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
  }

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

    if (getTab === 'parse') {
      let ds2 = getDataSource[getSelectedDataSource].extSettings.agentTransform.transform?.parse;
      if (!ds2) {
        ds2 = {};
      }
      tab.push(
        <div key={tab.length} className='container'>
          <ParseTab DataSource={DataSource[getFields]} Dcr={ds2} Update={(dcr) => {
            getDataSource[getSelectedDataSource].extSettings.agentTransform.transform.parse = dcr;
            setDataSource({ ...getDataSource });
          }} />
        </div>);
    }

    if (getTab === 'filter') {
      let ds2 = getDataSource[getSelectedDataSource].extSettings;
      if (!ds2) {
        ds2 = {};
      }
      tab.push(
        <div key={tab.length} className='container'>
          <FilterTab DataSource={DataSource[getFields]} DcrRoot={getDcr} Dcr={ds2} Update={(dcr) => {
            getDataSource[getSelectedDataSource].extSettings = dcr;
            setDataSource({ ...getDataSource });
          }} />
        </div>);
    }

    if (getTab === 'aggregation') {
      let ds2 = getDataSource[getSelectedDataSource].extSettings.agentTransform.transform;
      if (!ds2) {
        ds2 = {};
      }
      tab.push(
        <div key={tab.length} className='container'>
          <AggregationTab DataSource={DataSource[getFields]} Dcr={ds2} Update={(dcr) => {
            getDataSource[getSelectedDataSource].extSettings.agentTransform.transform = dcr;
            setDataSource({ ...getDataSource });
          }} />
        </div>);
    }

    if (getTab === 'select') {
      let ds2 = getDataSource[getSelectedDataSource].extSettings.agentTransform.transform;
      if (!ds2) {
        ds2 = [];
      }
      tab.push(
        <div key={tab.length} className='container'>
          <SelectTab DataSource={DataSource[getFields]} Dcr={ds2} Update={(dcr) => {
            getDataSource[getSelectedDataSource].extSettings.agentTransform.transform = dcr;
            setDataSource({ ...getDataSource });
          }} />
        </div>);
    }

    body.push(<div key={body.length}>
      <div className='mb-3'>
        <h3>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'setting' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('setting') }}>Settings</span>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'parse' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('parse') }}>Parse</span>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'filter' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('filter') }}>Filters</span>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'aggregation' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('aggregation') }}>Aggregations</span>
          <span className={'badge cursor-clickable mx-1 ' + (getTab === 'select' ? 'bg-primary' : 'bg-secondary')} onClick={e => { setTab('select') }}>Select</span>
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
