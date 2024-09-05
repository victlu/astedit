import React from 'react';
import './App.css';

function App() {
  const [getCount, setCount] = React.useState(0);
  const [getFilter, setFilter] = React.useState(null);
  const [getSelect, setSelect] = React.useState(null);
  const [getFields, setFields] = React.useState("Windows Events");

  const datasources = {
    "Performance Counters": [
      { col: "CounterName", ty: "string" },
      { col: "CounterValue", ty: "float" },
      { col: "SampleRate", ty: "int" },
      { col: "Counter", ty: "string" },
      { col: "Instance", ty: "string" },
    ],
    "Windows Events": [
      { col: "PublisherId", ty: "string" },
      { col: "TimeCreated", ty: "datetime" },
      { col: "PublisherName", ty: "int" },
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
    ]
  };

  const clickAddGroup = (e, i) => {
    let filter = getFilter;
    let obj = [ { field: "new", op: "==", value: "new" } ];
    filter.splice(i+1, 0, obj);
    setSelect({ row: i+1, term: 0});
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickRemoveGroup = (e, i) => {
    let filter = getFilter;
    filter.splice(i, 1);
    setSelect(null);
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
    setSelect(null);
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickAddTerm = (e, i, j) => {
    let filter = getFilter;
    filter[i].splice(j+1, 0, { field: "new", op: "==", value: "new"});
    setSelect({ row: i, term: filter[i].length-1});
    setFilter(filter);
    setCount(getCount+1);
  }

  const clickEditItem = (e, i, j) => {
    if (getSelect && getSelect.row === i && getSelect.term === j)
    {
      setSelect(null);
    }
    else
    {
      setSelect({ row: i, term: j});
    }
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

  let filter = getFilter;
  if (!filter)
  {
    filter = []
    setFilter(filter);
  }

  let body = [];

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
    <div className="col col-4">
      <select className="form-select"
        value={getFields}
        onChange={e => { clickUpdateDataSource(e, e.target.value)}}>
        {ds}
      </select>
    </div>
  </div>);

  // **********************************

  let field_elem = [];
  let fields1 = datasources[getFields];
  fields1.forEach((o) => {
    field_elem.push(<option>{o.col}</option>);
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

      term.push(
        <div className="row">
          <div className="col col-5 fw-light">
            Field:
          </div>
          <div className="col col-2 fw-light">
            Operation:
          </div>
          <div className="col col-5 fw-light">
            Value:
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
            and
          </div>
        </div>);
      }

      fields.push(<div className="container p-2 mb-3 bg-primary">
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
            or
          </div>
        </div>
      </div>);
    }

    groups.push(<div className="row">
      <div className="row badge bg-secondary mr-1 mb-3 pt-3 pb-3">
        {fields}
        {field_ctrl}
      </div>
      </div>);
  }

  body.push(<div className="container">
    {groups}
  </div>)

  if (filter.length === 0)
  {
    body.push(
      <div>
      <span 
      className="badge bg-success cursor-clickable mr-1"
      onClick={ e => { clickAddGroup(e, -1);}}
      >+</span>
      </div>
    );
  }

  // **********************************
  // Generate JSON

  body.push( <hr/>);

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
  body.push(<p>{filterText}</p>)

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
