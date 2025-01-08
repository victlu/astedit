import React from 'react';
import './App.css';
import { CheckIcon, SquareIcon } from './icons';

function SelectTab(props) {
  const ReadDcrProps = () => {
    let p = props.Dcr?.selectFields;
    if (!p) {
      p = [];
    }
    return p;
  }

  const SaveDcrProps = (dcr) => {
    let p = props.Dcr;
    p.selectFields = dcr;
    props.Update(p);
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

  let field_elem = [];

  if (props.Dcr?.aggregates?.distinct) {
    props.Dcr.aggregates.distinct.forEach(item => {
      field_elem.push("distinct_" + item);
    })
  }

  if (props.Dcr?.aggregates?.avg) {
    props.Dcr.aggregates.avg.forEach(item => {
      field_elem.push("avg_" + item);
    })
  }

  if (props.Dcr?.aggregates?.min) {
    props.Dcr.aggregates.min.forEach(item => {
      field_elem.push("min_" + item);
    })
  }

  if (props.Dcr?.aggregates?.max) {
    props.Dcr.aggregates.max.forEach(item => {
      field_elem.push("max_" + item);
    })
  }

  if (props.Dcr?.aggregates?.sum) {
    props.Dcr.aggregates.sum.forEach(item => {
      field_elem.push("sum_" + item);
    })
  }

  if (field_elem.length === 0) {
    props.DataSource.forEach((o) => {
      field_elem.push(o.col);
    });

    if (props.Dcr?.parse) {
      Object.keys(props.Dcr.parse).forEach(item => {
        field_elem.push(item);
      })
    }
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

    rows.push(
      <div key={rows.length} className="row mb-2">
        <div className="col col-4"><option key={field_elem.length}>{item}</option></div>
        <div className="col col-1 cursor-clickable" onClick={() => { ClickSelectField(item); }}>
          {include ? CheckIcon() : SquareIcon()}
        </div>
        <div className="col col-5">
          {include &&
            <input className="form-control" type='text'
              onChange={(e) => {
                UpdateSelectField(item, e.target.value);
              }}
              value={name} />
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

  return sections;
}

export default SelectTab;
