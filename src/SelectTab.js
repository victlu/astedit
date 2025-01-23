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
    table_fields[item.name] = item.type;
  })

  let field_elem = [];

  if (props.AggDcr?.distinct) {
    props.AggDcr.distinct.forEach(item => {
      field_elem.push("distinct_" + item);
    })
  }

  if (props.AggDcr?.avg) {
    props.AggDcr.avg.forEach(item => {
      field_elem.push("avg_" + item);
    })
  }

  if (props.AggDcr?.min) {
    props.AggDcr.min.forEach(item => {
      field_elem.push("min_" + item);
    })
  }

  if (props.AggDcr?.max) {
    props.AggDcr.max.forEach(item => {
      field_elem.push("max_" + item);
    })
  }

  if (props.AggDcr?.sum) {
    props.AggDcr.sum.forEach(item => {
      field_elem.push("sum_" + item);
    })
  }

  if (field_elem.length === 0) {
    props.DataSource.forEach((o) => {
      field_elem.push(o.col);
    });

    if (props.ExtendDcr) {
      Object.keys(props.ExtendDcr).forEach(item => {
        field_elem.push(item);
      })
    }
  } else {
    field_elem.push("ast_count");
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
        <div className="col col-4"><option key={field_elem.length}>{item}</option></div>
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
    if (dup[item.projectAs]) {
      errors.push(<div className="text-danger"><DiamonExclamation /> Field <b>{item.field}</b> has duplicate <i>Project As</i>.</div>);
    }
    dup[item.projectAs] = true;
  });

  Object.keys(table_fields).forEach(item => {
    if (!dup[item]) {
      errors.push(<div className="text-danger"><DiamonExclamation /> <i>Project As</i> is missing <b>{item}</b>.</div>);
    }
  });

  if (errors.length > 0) {
    sections.push(
      <div className="container p-2 mt-4"
        style={{ backgroundColor: 'lightgrey' }}
      >
        {errors}
      </div>
    )
  }

  return sections;
}

export default SelectTab;
