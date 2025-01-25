import React from 'react';
import './App.css';
import { CheckIcon, SquareIcon, DiamonExclamationIcon } from './icons';

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
        let p1 = {
          field: item.field,
        };
        if (item.projectAs && item.projectAs.length > 0) {
          p1.projectAs = item.projectAs;
        }
        p.push(p1);
      }
    });
    if (!found) {
      p.push({
        field: field,
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
    field_elem.push("AST_Count");
    field_type["AST_Count"] = "int";
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
      <div className="col col-5"><b>Field</b></div>
      <div className="col col-1"><b>Include</b></div>
      <div className="col col-6"><b>Project As</b></div>
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
      column_options.push(<option value={item}>{item}</option>)
    })

    rows.push(
      <div key={rows.length} className="row mb-2">
        <div className="col col-5"><option>{item}</option></div>
        <div className="col col-1 cursor-clickable" onClick={() => { ClickSelectField(item); }}>
          {include ? CheckIcon() : SquareIcon()}
        </div>
        <div className="col col-6">
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
    let projectAs = item.projectAs && item.projectAs.length > 0 ? item.projectAs : item.field;

    if (projectAs === "TimeGenerated") {
      errors.push(<span>Field <i>{item.field}</i> cannot Project As <b>TimeGenerated</b>.</span>);
    }

    if (dup[projectAs]) {
      errors.push(<span>Field <i>{item.field}</i> has a duplicate Project As <b>{projectAs}</b>.</span>);
    }
    dup[projectAs] = true;
  });

  Object.keys(table_fields).forEach(item => {
    if (!dup[item]) {
      errors.push(<span>Missing <b>{item}</b> for output Stream.</span>);
    }
  });

  if (errors.length > 0) {
    let lines = [];
    errors.forEach(err => {
      lines.push(<div className="text-danger"><DiamonExclamationIcon />&nbsp;{err}</div>);
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
