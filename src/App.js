import React from 'react';
import './App.css';

function App() {
  const [getCount, setCount] = React.useState(0);
  const [getFilter, setFilter] = React.useState(null);
  const [getSelect, setSelect] = React.useState(null);

  const clickAddGroup = (e, i) => {
    let filter = getFilter;
    let obj = [ { field: "new", op: "=", value: "new-" + getCount } ];
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

  const clickAddTerm = (e, i) => {
    let filter = getFilter;
    filter[i].push({ field: "new", op: "=", value: "new"});
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
    filter = [
      [
        { field: "hello1", op: "=", value: "that1" },
        { field: "hello2", op: "=", value: "that2" },
        { field: "hello3", op: "=", value: "that2" },
      ],
      [
        { field: "hello3", op: "=", value: "that3" },
        { field: "hello4", op: "=", value: "that4" },
      ]
    ];
    setFilter(filter);
  }

  let body = [];
  for (let i = 0; i < filter.length; i++)
  {
    let fields = [];
    for (let j = 0; j < filter[i].length; j++)
    {
      let rec = filter[i][j];

      let sel="bg-primary"
      if (getSelect && getSelect.row === i && getSelect.term === j)
      {
        sel = "bg-danger"
      }

      let cond = <span
        className={"badge cursor-clickable mr-1 " + sel}
        onClick={ e => { clickEditItem(e, i, j)}}
        >{rec.field} {rec.op} {rec.value}</span>

      if (j > 0)
      {
        fields.push(<span className="cursor-normal"> AND </span>);
      }
      fields.push(cond);
    }

    fields.push(<span 
      className="badge bg-success cursor-clickable mr-1"
      onClick={ e => { clickAddTerm(e, i);}}
      >+</span>);

    if (i > 0)
    {
      body.push(<div>OR</div>)
    }
    body.push(<div>
      <span className="badge bg-secondary mr-1">{fields}</span>
      <span 
        className="badge bg-success cursor-clickable mr-1"
        onClick={ e => { clickAddGroup(e, i);}}
        >+</span>
      <span 
        className="badge bg-success cursor-clickable"
        onClick={ e => { clickRemoveGroup(e, i);}}
        >-</span>
      </div>);

    if (getSelect && getSelect.row === i)
    {
      let j = getSelect.term;
      let rec = filter[i][j];

      let op_elem = [];
      let ops = ["==", "!=", "<", ">"];
      for (let o of ops)
      {
        op_elem.push(<option>{o}</option>);
      }

      let field_elem = [];
      let fields = ["field1", "timestamp", "record2", "pid", "message"];
      for (let o of fields)
      {
        field_elem.push(<option>{o}</option>);
      }

      body.push(
        <div>
          <hr />
          <table>
            <tr>
              <td>
                <select className="form-select"
                  value={rec.field}
                  onChange={e => { clickUpdateItem(e, i, j, e.target.value, null, null)}}>
                  {field_elem}
                </select>
              </td>
              <td>
                <select className="form-select"
                  value={rec.op}
                  onChange={e => { clickUpdateItem(e, i, j, null, e.target.value, null)}}>
                  {op_elem}
                </select>
              </td>
              <td>{rec.value}</td>
            </tr>
          </table>
          <hr />
        </div>
      );
    }
  }

  if (filter.length == 0)
  {
    body.push(
      <div>
      <span 
      className="badge bg-success cursor-clickable mr-1"
      onClick={ e => { clickAddGroup(e, 0);}}
      >+</span>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Agent-Side Transform: Filter Editor</p>
      </header>
      <div className="App-body">
        <div>Filter:</div>
        {body}
      </div>
    </div>
  );
}

export default App;
