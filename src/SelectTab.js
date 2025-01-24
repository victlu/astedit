import React from 'react';
import './App.css';
import { CheckIcon, SquareIcon, DiamonExclamation } from './icons';

function SelectTab(props) {
  const ReadDcrProps = () => {
    return props.Dcr;
  }

  const SaveDcrProps = (dcr) => {
    props.Update(dcr);
  }

  const ClickSelectField = (field) => {
    let p = [];

    let found = false;

    ReadDcrProps().forEach(item => {
      if (item.field === field) {
        found = true;
      }
      else {
        p.push({
          field: item.field,
          projectAs: item.projectAs,
        });
      }
    });
    if (!found) {
      p.push({
        field: field,
        projectAs: field,
      });
    }

    SaveDcrProps(p);
  }

  const UpdateSelectField = (field, name) => {
    let p = ReadDcrProps();

    p.forEach(item => {
      if (item.field === field) {
        item.projectAs = name;
      }
    });

    SaveDcrProps(p);
  }

  // **********************************

  let sections = []

  sections.push(
    <div key={sections.length} className="container">
      <h4>Field Selection</h4>
      <div className="mb-3">
        Select the <b>Field</b> to include.
      </div>
    </div>
  );

  let table_fields = {};
  let streamSelected = props.Dcr?.streams?.[0];
  if (!streamSelected) {
    streamSelected = Object.keys(props.DcrRoot.properties.streamDeclarations)[0];
  }
  let streamDecl = props.DcrRoot.properties.streamDeclarations[streamSelected];
  streamDecl.columns.forEach(item => {
    if (item.name !== "TimeGenerated") {
      table_fields[item.name] = item.type;
    }
  })

  let field_elem = [];
  let field_type = {};

  props.DataSource.forEach((o) => {
    field_type[o.col] = o.ty;
  });
  field_type["TimeGenerated"] = "datetime";

  if (props.AggDcr?.groupBy) {
    props.AggDcr.groupBy.forEach(item => {
      field_elem.push(item);
      field_type[item] = "string";
    })
  }

  if (props.AggDcr?.avg) {
    props.AggDcr.avg.forEach(item => {
      let f = "avg_" + item;
      field_elem.push(f);
      field_type[f] = "float";
    })
  }

  if (props.AggDcr?.min) {
    props.AggDcr.min.forEach(item => {
      let f = "min_" + item;
      field_elem.push(f);
      field_type[f] = field_type[item] === "datetime" ? "datetime" : "int";
    })
  }

  if (props.AggDcr?.max) {
    props.AggDcr.max.forEach(item => {
      let f = "max_" + item;
      field_elem.push(f);
      field_type[f] = field_type[item] === "datetime" ? "datetime" : "int";
    })
  }

  if (props.AggDcr?.sum) {
    props.AggDcr.sum.forEach(item => {
      let f = "sum_" + item;
      field_elem.push(f);
      field_type[f] = "float";
    })
  }

  if (field_elem.length === 0) {
    field_elem.push("TimeGenerated");
    field_type["TimeGenerated"] = "datetime";
    props.DataSource.forEach((o) => {
      field_elem.push(o.col);
      field_type[o.col] = o.ty;
    });

    if (props.ExtendDcr) {
      Object.keys(props.ExtendDcr).forEach(item => {
        field_elem.push(item);
        field_type[item] = "string";
      })
    }
  } else {
    field_elem.push("ast_count");
    field_type["ast_count"] = "int";
  }

  let selectIdx = {};
  let selectList = [];
  let dirty = false;
  let dcr = ReadDcrProps();
  dcr.forEach(item => {
    let found = false;
    field_elem.forEach(col => {
      if (col === item.field) {
        found = true;
      }
    });

    if (found) {
      selectList.push(item);
    }
    else {
      dirty = true;
    }

    selectIdx[item.field] = {
      projectAs: item.projectAs,
    }
  })
  if (dirty) {
    SaveDcrProps(selectList);
  }

  let rows = [];

  rows.push(
    <div key={rows.length} className="row">
      <div className="col col-4"><b>Field</b></div>
      <div className="col col-2"><b>Type</b></div>
      <div className="col col-1"><b>Include</b></div>
      <div className="col col-5"><b>Project As</b></div>
    </div>
  );

  field_elem.forEach((item) => {
    let include = false;
    let name = "";

    let curIdx = selectIdx[item];
    if (curIdx) {
      include = true;
      name = curIdx.projectAs;
    }

    let column_options = [];
    column_options.push(<option selected></option>)
    Object.keys(table_fields).forEach(item => {
      let ty = table_fields[item]
      column_options.push(<option value={item}>{item} ({ty})</option>)
    })

    rows.push(
      <div key={rows.length} className="row mb-2">
        <div className="col col-4"><option>{item}</option></div>
        <div className="col col-2"><option>{field_type[item]}</option></div>
        <div className="col col-1 cursor-clickable" onClick={() => { ClickSelectField(item); }}>
          {include ? CheckIcon() : SquareIcon()}
        </div>
        <div className="col col-5">
          {include &&
            <span style={{ display: 'flex' }}>
              <input className="form-control" type='text'
                onChange={(e) => {
                  UpdateSelectField(item, e.target.value);
                }}
                style={{ display: "inline" }}
                value={name} />
              <select id='sel' className="form-select"
                onChange={(e) => {
                  UpdateSelectField(item, e.target.value);
                }}
                style={{ width: "0px" }}
                value=""
              >
                {column_options}
              </select>
            </span>
          }
        </div>
      </div>
    )
  });

  sections.push(
    <div key={sections.length} className='container'>
      {rows}
    </div>
  );

  // **********************************

  let errors = [];

  let dup = {};
  let p = ReadDcrProps();
  p.forEach(item => {
    if (item.projectAs === "TimeGenerated") {
      errors.push(<span>Field <b>{item.field}</b> cannot <i>Project As</i> reserved word <b>TimeGenerated</b>.</span>);
    }

    if (dup[item.projectAs]) {
      errors.push(<span>Field <b>{item.field}</b> has duplicate <i>Project As</i>.</span>);
    }

    let ty = table_fields[item.projectAs]
    if (ty !== field_type[item.field]) {
      errors.push(<span>Field <b>{item.field}</b> and <b>{item.projectAs}</b> has mismatched types.</span>);
    }
    dup[item.projectAs] = true;
  });

  Object.keys(table_fields).forEach(item => {
    if (!dup[item]) {
      errors.push(<span><i>Project As</i> is missing <b>{item}</b>.</span>);
    }
  });

  if (errors.length > 0) {
    let lines = [];
    errors.forEach(err => {
      lines.push(<div className="text-danger"><DiamonExclamation />&nbsp;{err}</div>);
    })
    sections.push(
      <div className="container p-2 mt-4"
        style={{ backgroundColor: 'lightgrey' }}
      >
        {lines}
      </div>
    )
  }

  return sections;
}

export default SelectTab;
