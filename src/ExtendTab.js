import React from 'react';
import './App.css';

let cef_fields = [
  "act", "app", "cat", "cnt", "DeviceVendor", "DeviceProduct", "DeviceVersion",
  "destinationDnsDomain", "destinationServiceName"
];

function ExtendTab(props) {
  const lookup = {
    xmlParser: ["field", "xPathQuery"],
    jsonParser: ["field", "jsonPathQuery"],
    regExParser: ["field", "regExPattern"],
    cefParser: ["field", "keyToExtract"],
    kvParser: ["field", "keyToExtract", "pairDelimiter", "fieldDelimiter"],
  };

  const ReadParseField = () => {
    let dcr = props.Dcr;
    let p = [];

    Object.keys(dcr).forEach(name => {
      let o = dcr[name];
      let o1 = o[o.evalType];
      let e = {};
      e.name = name;
      e.parser = o.evalType;
      lookup[o.evalType].forEach(field => {
        let v = o1[field];
        e[e.parser + '_' + field] = v ? v : "";
      });
      p.push(e);
    });

    return p;
  }

  const SaveParseField = (dcr) => {
    let n = {};

    dcr.forEach(ent => {
      n[ent.name] = {};
      let o = n[ent.name];
      o.evalType = ent.parser;
      o[ent.parser] = {};
      let o1 = o[ent.parser];

      lookup[ent.parser].forEach(f => {
        let v = ent?.[ent.parser + '_' + f];
        o1[f] = v;
      });
    });

    console.log("SaveParseField", n);

    props.Update(n);
  }

  const AddParseField = () => {
    SaveParseField([
      ...ReadParseField(),
      {
        field: props.DataSource[0].col,
        name: "custom_" + ("0000" + Math.floor(Math.random() * 10000)).slice(-4),
        parser: "xmlParser",
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

  const xmlParser = (item, n1) => {
    let parser_header = [];
    let parser_body = [];

    parser_header.push(<div className="col col-3 text-start fw-light mb-1">
      Field
    </div>);

    parser_body.push(
      <div className="col col-3">
        <select className="form-select" value={item.xmlParser_field}
          onChange={(e) => {
            item.xmlParser_field = e.target.value;
            UpdateParseField(n1, item);
          }}
        >
          {field_elem}
        </select>
      </div>
    );

    parser_header.push(
      <div className="col col-4 text-start fw-light mb-1">
        XPath
      </div>
    );

    parser_body.push(
      <div className="col col-4">
        <input className="form-control" type='text'
          onChange={(e) => {
            item.xmlParser_xPathQuery = e.target.value;
            UpdateParseField(n1, item);
          }}
          value={item.xmlParser_xPathQuery} />
        <span className="fw-light" style={{ fontSize: '12px' }}>
          e.g. /Event/EventData/Data[@Name='SubjectUserName']
        </span>
      </div>
    );

    return [parser_header, parser_body];
  }

  const jsonParser = (item, n1) => {
    let parser_header = [];
    let parser_body = [];

    parser_header.push(<div className="col col-3 text-start fw-light mb-1">
      Field
    </div>);

    parser_body.push(
      <div className="col col-3">
        <select className="form-select" value={item.jsonParser_field}
          onChange={(e) => {
            item.jsonParser_field = e.target.value;
            UpdateParseField(n1, item);
          }}
        >
          {field_elem}
        </select>
      </div>
    );

    parser_header.push(
      <div className="col col-4 text-start fw-light mb-1">
        Json Path Query
      </div>
    );

    parser_body.push(
      <div className="col col-4">
        <input className="form-control" type='text'
          onChange={(e) => {
            item.jsonParser_jsonPathQuery = e.target.value;
            UpdateParseField(n1, item);
          }}
          value={item.jsonParser_jsonPathQuery} />
        <span className="fw-light" style={{ fontSize: '12px' }}>
          e.g. $.StartDate
        </span>
      </div>
    );

    return [parser_header, parser_body];
  }

  const regexParser = (item, n1) => {
    let parser_header = [];
    let parser_body = [];

    parser_header.push(<div className="col col-3 text-start fw-light mb-1">
      Field
    </div>);

    parser_body.push(
      <div className="col col-3">
        <select className="form-select" value={item.regExParser_field}
          onChange={(e) => {
            item.regExParser_field = e.target.value;
            UpdateParseField(n1, item);
          }}
        >
          {field_elem}
        </select>
      </div>
    );

    parser_header.push(
      <div className="col col-4 text-start fw-light mb-1">
        RegEx Pattern
      </div>
    );

    parser_body.push(
      <div className="col col-4">
        <input className="form-control" type='text'
          onChange={(e) => {
            item.regExParser_regExPattern = e.target.value;
            UpdateParseField(n1, item);
          }}
          value={item.regExParser_regExPattern} />
        <span className="fw-light" style={{ fontSize: '12px' }}>
          e.g. .....$
        </span>
      </div>
    );

    return [parser_header, parser_body];
  }

  const cefParser = (item, n1) => {
    let parser_header = [];
    let parser_body = [];

    parser_header.push(<div className="col col-3 text-start fw-light mb-1">
      Field
    </div>);

    parser_body.push(
      <div className="col col-3 mb-1">
        <select className="form-select" value={item.cefParser_field}
          onChange={(e) => {
            item.cefParser_field = e.target.value;
            UpdateParseField(n1, item);
          }}
        >
          {field_elem}
        </select>
      </div>
    );

    let parser_cef_select = [];
    cef_fields.forEach(field => {
      parser_cef_select.push(<option>{field}</option>)
    });

    parser_header.push(
      <div className="col col-4 text-start fw-light mb-1">
        CEF Field
      </div>
    );

    parser_body.push(
      <div className="col col-4">
        <span className="container p-0 m-0">
          <span className="row gx-0">
            <span className="col col-7">
              <input className="form-control" type='text'
                onChange={(e) => {
                  item.cefParser_keyToExtract = e.target.value;
                  UpdateParseField(n1, item);
                }}
                value={item.cefParser_keyToExtract} />
            </span>
            <span className="col col-5">
              <select className="form-select"
                value=""
                onChange={e => {
                  item.cefParser_keyToExtract = e.target.value;
                  UpdateParseField(n1, item);
                }}>
                <option></option>
                {parser_cef_select}
              </select>
            </span>
          </span>
        </span>
      </div>
    );

    return [parser_header, parser_body];
  }

  const kvParser = (item, n1) => {
    let parser_header = [];
    let parser_body = [];

    parser_header.push(<div className="col col-2 text-start fw-light mb-1">
      Field
    </div>);

    parser_body.push(
      <div className="col col-2 mb-4">
        <select className="form-select" value={item.kvParser_field}
          onChange={(e) => {
            item.kvParser_field = e.target.value;
            UpdateParseField(n1, item);
          }}
        >
          {field_elem}
        </select>
      </div>
    );

    parser_header.push(
      <div className="col col-3 text-start fw-light mb-1">
        Key
      </div>
    );

    parser_body.push(
      <div className="col col-3">
        <input className="form-control" type='text'
          onChange={(e) => {
            item.kvParser_keyToExtract = e.target.value;
            UpdateParseField(n1, item);
          }}
          value={item.kvParser_keyToExtract} />
      </div>
    );

    parser_header.push(
      <div className="col col-1 text-start fw-light mb-1" style={{ fontSize: "14px" }}>
        Pair Delimiter
      </div>
    );

    parser_body.push(
      <div className="col col-1">
        <input className="form-control" type='text'
          onChange={(e) => {
            item.kvParser_pairDelimiter = e.target.value;
            UpdateParseField(n1, item);
          }}
          value={item.kvParser_pairDelimiter} />
      </div>
    );

    parser_header.push(
      <div className="col col-1 text-start fw-light mb-1" style={{ fontSize: "14px" }}>
        Field Delimiter
      </div>
    );

    parser_body.push(
      <div className="col col-1">
        <input className="form-control" type='text'
          onChange={(e) => {
            item.kvParser_fieldDelimiter = e.target.value;
            UpdateParseField(n1, item);
          }}
          value={item.kvParser_fieldDelimiter} />
      </div>
    );

    return [parser_header, parser_body];
  }

  // **********************************

  let sections = [];

  sections.push(
    <div key={sections.length} className="container">
      <h4>Extend Fields</h4>
      <div className="mb-3">
        Define a new <b>Extend Field</b> by using a <b>Parser</b> method to extract a value.
        Each <b>Parser</b> method has additional required parameters.
      </div>
    </div>
  );

  sections.push(
    <div key={sections.length} className="mb-2" style={{ fontWeight: 500 }}>
      Extend Fields:
    </div>
  );

  let field_elem = [];
  field_elem.push(<option key={field_elem.length}></option>);
  props.DataSource.forEach((o) => {
    field_elem.push(<option key={field_elem.length}>{o.col}</option>);
  });

  let parser_options = {
    "xmlParser": { display: "XML", parser: xmlParser },
    "jsonParser": { display: "Json", parser: jsonParser },
    "regExParser": { display: "RegEx", parser: regexParser },
    "cefParser": { display: "CEF", parser: cefParser },
    "kvParser": { display: "Key-Value", parser: kvParser },
  }

  let parse_elem = [];
  for (let o of Object.keys(parser_options)) {
    parse_elem.push(<option key={parse_elem.length} value={o}>{parser_options[o].display}</option>);
  }

  let parse = ReadParseField();
  let n = 0;
  parse.forEach(item => {
    let n1 = n;
    let curr = item;

    let parser_header = [];
    let parser_body = [];
    [parser_header, parser_body] = parser_options[item.parser].parser(item, n1);

    sections.push(
      <div key={sections.length} className="container p-2 mb-2" style={{ backgroundColor: 'lightgrey' }}>
        <div className="row">
          <div className="col col-3 text-start fw-light mb-1">
            Extend Field
          </div>
          <div className="col col-2 text-start fw-light mb-1">
            Parser
          </div>
          {parser_header}
        </div>

        <div className="row">
          <div className="col col-3">
            <input className="form-control" type='text'
              onChange={(e) => {
                curr.name = e.target.value;
                UpdateParseField(n1, curr);
              }}
              value={item.name} />
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

          {parser_body}

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

export default ExtendTab;
