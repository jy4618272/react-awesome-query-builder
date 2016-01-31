import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import shouldPureComponentUpdate from 'react-pure-render/function';
import map from 'lodash/collection/map';
import size from 'lodash/collection/size';
import RuleContainer from './containers/RuleContainer';
import DropdownMenu, { NestedDropdownMenu } from 'react-dd-menu';
require('react-dd-menu/dist/react-dd-menu.css');

import {Row, Col, Button, Input} from "react-bootstrap";
React.Bootstrap = require('react-bootstrap');
React.Bootstrap.Select = require('react-bootstrap-select');
require('react-bootstrap-select/less/bootstrap-select.less');

import keys from 'lodash/object/keys';
import pick from 'lodash/object/pick';
import omit from 'lodash/object/omit';
import mapKeys from 'lodash/object/mapkeys';

var stringify = require('json-stringify-safe');

@RuleContainer
export default class Rule extends Component {
  static propTypes = {
    fieldOptions: PropTypes.object.isRequired,
    operatorOptions: PropTypes.object.isRequired,
    setField: PropTypes.func.isRequired,
    setOperator: PropTypes.func.isRequired,
    removeSelf: PropTypes.func.isRequired,
    selectedField: PropTypes.string,
    selectedOperator: PropTypes.string
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

    constructor(props) {
        super(props);
        this.state = {
            isFieldOpen: false,
            curField: "Field"
        };
    }

    toggle() {
        this.setState({ isFieldOpen: !this.state.isFieldOpen });
    }

    close() {
        this.setState({ isFieldOpen: false });
    }

    handleFieldSelect1() {
    const node = ReactDOM.findDOMNode(this.refs.field);
    this.props.setField(node.value);
  }

  handleFieldSelect(label, value) {
//    console.log("Field clicked. Label="+label+" value="+value);
    this.props.setField(value);
    this.setState({curField: label});
  }

  handleOperatorSelect() {
    const node = ReactDOM.findDOMNode(this.refs.operator);
//    console.log("In handleOperatorSelect. value="+this.refs.operator.getValue());
    this.props.setOperator(this.refs.operator.getValue());
  }

  getFieldMenu(fields, prefix) {
    if (prefix === undefined) {
        prefix = '';
    } else {
        prefix = prefix + '.';
    }

    const direct_fields = omit(fields, (value, key)=> key.indexOf('.') > -1);
    return keys(direct_fields).map(field => {
        if (fields[field].widget == "submenu") {
//            console.log("Got submenu for field "+field);
            var child_fields = pick(fields, (value, key)=> key.startsWith(prefix+field+"."));
            child_fields = mapKeys(child_fields, (value, key) => key.substring((prefix+field).length+1));
//            console.log("child_fields="+stringify(child_fields));
            return <NestedDropdownMenu key={prefix+field} toggle={<a href="#">{fields[field].label}</a>} direction="right">
                        {this.getFieldMenu(child_fields, prefix+field)}
                   </NestedDropdownMenu>
        } else {
//            console.log("Got single field. prefix="+prefix+" field="+field+" entire field="+stringify(fields[field]));
            return <li key={prefix+field}><button type="button" onClick={this.handleFieldSelect.bind(this, fields[field].label, prefix+field)}>{fields[field].label}</button></li>
        }
    })
  }

  render() {
//    console.log("Rendering rule. fieldOptions="+stringify(this.props.fieldOptions));
/*    var field_items = [];
    map(this.props.fieldOptions, (label, value)=>
        field_items.push({label: label, value: value})
        );
    {map(this.props.fieldOptions, (label, item)=>
        <li key={value}><button type="button" onClick={this.handleFieldSelect.bind(this, label, item.value)}>{label}</button></li>
    )}
    console.log("fields="+stringify(field_items));*/
    let fieldMenuOptions = {
        isOpen: this.state.isFieldOpen,
        close: this.close.bind(this),
        toggle: <Button bsStyle="primary" onClick={this.toggle.bind(this)}>{this.state.curField} <span className="caret"/></Button>,
        nested: 'right',
        direction: 'right',
        align: 'left',
        animate: true
        };
    return (
      <div className="rule">
        <div className="rule--header">
          <div className="rule--actions">
            <button className="action action--DELETE" onClick={this.props.removeSelf}>Delete</button>
          </div>
        </div>
        <Row className="rule--body">
          {size(this.props.fieldOptions) ? (
            <Col key="field" className="rule--field" xs={1}>
                <label>Field</label>
                <DropdownMenu {...fieldMenuOptions}>
                    { this.getFieldMenu(this.props.fieldOptions)}
                </DropdownMenu>
            </Col>
          ) : null}
          {size(this.props.operatorOptions) ? (
            <Col key="operator" className="rule--operator" xs={2}>
              <label>Operator</label>
              <Input className="btn-success" type="select" ref="operator" value={this.props.selectedOperator} onChange={this.handleOperatorSelect.bind(this)}>
                {map(this.props.operatorOptions, (label, value) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Input>
            </Col>
          ) : null}
          {this.props.children}
        </Row>
      </div>
    );
  }

  render1() {
   return (
      <div className="rule">
        <div className="rule--header">
          <div className="rule--actions">
            <button className="action action--DELETE" onClick={this.props.removeSelf}>Delete</button>
          </div>
        </div>
        <div className="rule--body">
          {size(this.props.fieldOptions) ? (
            <div key="field" className="rule--field">
              <label>Field</label>
              <select ref="field" value={this.props.selectedField} onChange={this.handleFieldSelect.bind(this)}>
                {map(this.props.fieldOptions, (label, value) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ) : null}
          {size(this.props.operatorOptions) ? (
            <div key="operator" className="rule--operator">
              <label>Operator</label>
              <select ref="operator" value={this.props.selectedOperator} onChange={this.handleOperatorSelect.bind(this)}>
                {map(this.props.operatorOptions, (label, value) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ) : null}
          {this.props.children}
        </div>
      </div>
    );
  }
}