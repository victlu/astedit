import React from 'react';
import './App.css';

function FilterTab(props) {
  const ReadDcrProps = () => {
    return props.Dcr;
  }

  const SaveDcrProps = (dcr) => {
    props.Update(dcr);
  }

  const clickAddGroup = (e, i) => {
    let filter = ReadDcrProps();
    let firstfield = props.DataSource[0].col
    let obj = [{ field: firstfield, op: "==", value: "" }];
    filter.splice(i + 1, 0, obj);
    SaveDcrProps(filter);
  }

  const clickRemoveGroup = (e, i) => {
    let filter = ReadDcrProps();
    filter.splice(i, 1);
    SaveDcrProps(filter);
  }

  const clickRemoveTerm = (e, i, j) => {
    let filter = ReadDcrProps();
    if (filter[i].length === 1) {
      filter.splice(i, 1);
    }
    else {
      filter[i].splice(j, 1);
    }
    SaveDcrProps(filter);
  }

  const clickAddTerm = (e, i, j) => {
    let filter = ReadDcrProps();
    let firstfield = props.DataSource[0].col
    filter[i].splice(j + 1, 0, { field: firstfield, op: "==", value: "" });
    SaveDcrProps(filter);
  }

  const clickUpdateItem = (e, i, j, field, op, val) => {
    let filter = ReadDcrProps();
    if (field) {
      filter[i][j].field = field;
    }
    if (op) {
      filter[i][j].op = op;
    }
    filter[i][j].value = val;

    SaveDcrProps(filter);
  }

  // **********************************

  let sections = [];

  sections.push(
    <div key={sections.length} className="container">
      <h4>Filter Groups</h4>
      <div className="mb-3">
        Specify the filters / groups below. Please note: among groups,
        filter applies to any conditions are true (OR logic).
        Within groups, filter applies to all conditions are true (AND logic)
      </div>
    </div>
  );

  let filter = ReadDcrProps();

  let field_elem = [];
  let field_type = {};
  let field_desc = {};
  let fields1 = props.DataSource;
  fields1.forEach((o) => {
    field_elem.push(<option key={field_elem.length}>{o.col}</option>);
    field_type[o.col] = o.ty;
    field_desc[o.col] = o.desc;
  });

  let dcr2 = props.ParseDcr;
  if (dcr2) {
    Object.keys(dcr2).forEach(item => {
      field_elem.push(<option key={field_elem.length}>{item}</option>);
      field_type[item] = "string";
      field_desc[item] = "(Column from Parse tab)";
    })
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

  sections.push(groups);

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

  sections.push(footer);

  return sections;
}

export default FilterTab;
