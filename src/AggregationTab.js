import React from 'react';
import './App.css';
import { CheckIcon, SquareIcon, DashSquare } from './icons';

function AggregationTab(props) {
  const TransformGroups = ["groupBy", "min", "max", "avg", "sum"];

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
        else {
          dirty = true;
        }
      })

      dcr[grp] = list;

      if (dirty) {
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

    columns.push({
      col: "TimeGenerated",
      ty: "datetime",
    });

    props.DataSource.forEach(item => {
      columns.push(item);
    });

    if (props.ExtendDcr) {
      Object.keys(props.ExtendDcr).forEach(item => {
        columns.push({
          col: item,
          ty: 'string',
        })
      })
    }

    return columns;
  }

  const ClickBox = (col, agg) => {
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

          // Clean up rest...
          if (grp === "groupBy") {
            let grp2 = ["min", "max", "avg", "sum"];
            grp2.forEach(grp3 => {
              let list2 = [];
              dcr[grp3].forEach(o => {
                if (o !== col) {
                  list2.push(o);
                }
              });
              dcr[grp3] = list2;
            });
          }
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
    <span className='col col-2' style={headerStyle}>Type</span>
    <span className='col col-1 text-center' style={headerStyle}>GroupBy</span>
    <span className='col col-1 text-center' style={headerStyle}>Minimum</span>
    <span className='col col-1 text-center' style={headerStyle}>Maximum</span>
    <span className='col col-1 text-center' style={headerStyle}>Average</span>
    <span className='col col-1 text-center' style={headerStyle}>Sum</span>
  </div>)

  let columns = getColumns();

  let aggs = ReadDcrProps();

  let terms = ['groupBy', 'min', 'max', 'avg', 'sum']
  terms.forEach(term => {
    if (!aggs[term]) {
      aggs[term] = []
    }
  });

  columns.forEach(item => {
    let groupBy = null
    let min = null
    let max = null
    let avg = null
    let sum = null

    if (item.col !== "TimeGenerated") {
      groupBy = false;
    }

    if (item.ty === 'int' || item.ty === 'float') {
      min = false;
      max = false;
      avg = false;
      sum = false;
    }
    else if (item.ty === 'datetime') {
      min = false;
      max = false;
    }

    aggs.groupBy.forEach(col => {
      if (item.col === col) {
        groupBy = true;
      }
    })

    aggs.min.forEach(col => {
      if (item.col === col) {
        min = true
      }
    })

    aggs.max.forEach(col => {
      if (item.col === col) {
        max = true
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
      <span className='col col-2'>{item.ty}</span>
      {groupBy !== null ? <span className='col col-1 cursor-clickable text-center' onClick={() => ClickBox(item.col, 'groupBy')}>
        {groupBy ? CheckIcon() : SquareIcon()}
      </span>
        :
        <span className='col col-1'></span>
      }
      {min === null ? <span className='col col-1'></span> :
        groupBy ? <span className='col col-1 text-center'>&ndash;</span> :
          <span className='col col-1 cursor-clickable text-center' onClick={() => ClickBox(item.col, 'min')}>
            {min ? CheckIcon() : SquareIcon()}
          </span>
      }
      {max === null ? <span className='col col-1'></span> :
        groupBy ? <span className='col col-1 text-center'>&ndash;</span> :
          <span className='col col-1 cursor-clickable text-center' onClick={() => ClickBox(item.col, 'max')}>
            {max ? CheckIcon() : SquareIcon()}
          </span>
      }
      {avg === null ? <span className='col col-1'></span> :
        groupBy ? <span className='col col-1 text-center'>&ndash;</span> :
          <span className='col col-1 cursor-clickable text-center' onClick={() => ClickBox(item.col, 'avg')}>
            {avg ? CheckIcon() : SquareIcon()}
          </span>
      }
      {sum === null ? <span className='col col-1'></span> :
        groupBy ? <span className='col col-1 text-center'>&ndash;</span> :
          <span className='col col-1 cursor-clickable text-center' onClick={() => ClickBox(item.col, 'sum')}>
            {sum ? CheckIcon() : SquareIcon()}
          </span>
      }
    </div>)
  })

  sections.push(<div key={sections.length} className='container'>
    {fields}
  </div>)

  return sections;
}

export default AggregationTab;
