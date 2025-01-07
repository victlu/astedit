import React from 'react';
import './App.css';

function ParseTab(props) {
  const ReadParseField = () => {
    let p = [];
    let dcr = props.Dcr;

    Object.keys(dcr).forEach(item => {
      p.push(
        {
          name: item,
          field: dcr[item].field,
          parser: dcr[item].parser,
          parserSpecification: dcr[item].parserSpecification,
        }
      );
    })

    return p;
  }

  const SaveParseField = (dcr) => {
    let p = {};
    dcr.forEach(item => {
      p[item.name] = {
        field: item.field,
        parser: item.parser,
        parserSpecification: item.parserSpecification,
      }
    })
    props.Update(p);
  }

  const AddParseField = () => {
    SaveParseField([
      ...ReadParseField(),
      {
        field: props.DataSource[0].col,
        name: "custom_" + ("0000" + Math.floor(Math.random() * 10000)).slice(-4),
        parser: "xml",
        parserSpecification: "",
      }
    ]);
  }

  const RemoveParseField = (n) => {
    let p = ReadParseField();
    p.splice(n, 1);
    SaveParseField([
      ...p,
    ]);
  }

  const UpdateParseField = (n, item) => {
    let p = ReadParseField();
    p[n] = item;
    SaveParseField([
      ...p,
    ]);
  }

  let sections = [];

  sections.push(
    <div key={sections.length} className="container">
      <h4>Parse Fields</h4>
      <div className="mb-3">
        Specify an existing data source <b>Field</b> used to extract a new <b>Custom Field</b>.
        You specify the <b>Parser</b> and <b>Path</b> to use for this operation.
      </div>
    </div>
  );

  sections.push(
    <div key={sections.length} className="mb-2" style={{ fontWeight: 500 }}>
      Parse Fields:
    </div>
  );

  let field_elem = [];
  props.DataSource.forEach((o) => {
    field_elem.push(<option key={field_elem.length}>{o.col}</option>);
  });

  let parse_elem = [];
  for (let o of ["xml", "json", "regex", "string"]) {
    parse_elem.push(<option key={parse_elem.length}>{o}</option>);
  }

  let parse = ReadParseField();
  let n = 0;
  parse.forEach((item) => {
    let n1 = n;
    let curr = item;
    sections.push(
      <div key={sections.length} className="container p-2 mb-2" style={{ backgroundColor: 'lightgrey' }}>
        <div className="row">
          <div className="col col-3 text-start fw-light mb-1">
            Field
          </div>
          <div className="col col-2 text-start fw-light mb-1">
            Parser
          </div>
          <div className="col col-4 text-start fw-light mb-1">
            Parser Specification
          </div>
          <div className="col col-3 text-start fw-light mb-1">
            Custom Field
          </div>
        </div>
        <div className="row">
          <div className="col col-3">
            <select className="form-select" value={item.field}
              onChange={(e) => {
                curr.field = e.target.value;
                UpdateParseField(n1, curr);
              }}
            >
              {field_elem}
            </select>
          </div>

          <div className="col col-2">
            <select className="form-select" value={item.parser}
              onChange={(e) => {
                curr.parser = e.target.value;
                UpdateParseField(n1, curr);
              }}
            >
              {parse_elem}
            </select>
          </div>

          <div className="col col-4">
            <input className="form-control" type='text'
              onChange={(e) => {
                curr.parserSpecification = e.target.value;
                UpdateParseField(n1, curr);
              }}
              value={item.parserSpecification} />
          </div>

          <div className="col col-3">
            <input className="form-control" type='text'
              onChange={(e) => {
                curr.name = e.target.value;
                UpdateParseField(n1, curr);
              }}
              value={item.name} />
          </div>

          <div>
            <span className="link" key={sections.length} onClick={() => { RemoveParseField(n1); }}>
              Remove this field
            </span>
          </div>
        </div>
      </div>
    );
    n++;
  });

  sections.push(
    <span className="link mr-3"
      onClick={AddParseField}
    >Add more fields</span>
  );

  return sections;
}

export default ParseTab;
