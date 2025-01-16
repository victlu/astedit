import React from 'react';
import './App.css';
import { CheckIcon, SquareIcon } from './icons';

function AggregationTab(props) {
  const TransformGroups = ["distinct", "min", "max", "avg", "sum"];

  const ReadDcrProps = () => {
    // scrub out invalids
    let dcr = props.Dcr;

    let columns = getColumns();
    TransformGroups.forEach(grp => {
      let list = [];

      let dirty = false;

      let org = dcr[grp];
      if (!org) {
        org = [];
      }
      org.forEach(item => {
        let found = false;
        columns.forEach(col => {
          if (col.col === item) {
            found = true;
          }
        })

        if (found) {
          list.push(item);
        }
        else
        {
          dirty = true;
        }
      })

      dcr[grp] = list;

      if (dirty)
      {
        SaveDcrProps(dcr);
      }
    })

    return dcr;
  }

  const SaveDcrProps = (dcr) => {
    props.Update(dcr);
  }

  const getColumns = () => {
    let columns = [];

    props.DataSource.forEach(item => {
      columns.push(item);
    });

    if (props.ParseDcr) {
      Object.keys(props.ParseDcr).forEach(item => {
        columns.push({
          col: item,
          ty: 'string',
        })
      })
    }

    return columns;
  }

  const ClickBox = (col, agg) => {
    console.log("ClickBox", col, agg)

    let dcr = ReadDcrProps();

    TransformGroups.forEach(grp => {
      if (agg === grp) {
        let list = [];

        let found = false;
        dcr[grp].forEach(item => {
          if (item === col) {
            found = true;
          }
          else {
            list.push(item);
          }
        });
        if (!found) {
          list.push(col);
        }

        dcr[grp] = list;
      }
    })

    SaveDcrProps(dcr);
  }

  // **********************************

  let sections = [];

  sections.push(
    <div key={sections.length} className="container">
      <h4>Aggregations</h4>
      <div className="mb-3">
        Select the columns you like to summarize by.
      </div>
    </div>
  );

  let fields = []

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

  let columns = getColumns();

  let aggs = ReadDcrProps();

  let terms = ['distinct', 'min', 'max', 'avg', 'sum']
  terms.forEach(term => {
    if (!aggs[term]) {
      aggs[term] = []
    }
  });

  columns.forEach(item => {
    let distinct = null
    let min = null
    let max = null
    let avg = null
    let sum = null

    if (item.ty === 'string') {
      distinct = false
    }
    else if (item.ty === 'int' || item.ty === 'float' || item.ty === 'datetime') {
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

  sections.push(<div key={sections.length} className='container'>
    {fields}
  </div>)

  return sections;
}

export default AggregationTab;
