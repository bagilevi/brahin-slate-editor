import React, { Component } from 'react';
import './VisualState.css';
import { List, Map } from 'immutable';

class VisualState extends Component {
  state = {
    expanded: true,
  }

  render() {
    const { object } = this.props;
    if (object === null) return <span>null</span>;
    if (object === undefined) return <span>undefined</span>;
    const kind = object.constructor.name;
    if (kind === 'Number' || kind === 'String' || kind === 'Boolean') {
      return this.renderScalar();
    }
    return (
      <div className={`VisualState ${kind}`} onClick={this.handleClick}>
        <div className="header">
          <div className="kind">{kind}</div>
        </div>
        {
          this.state.expanded ? (
            this.renderBody()
          ) : '...'
        }
      </div>
    )
  }

  renderBody() {
    const { object } = this.props;

    return (
      <div className="body">
        {
          // Record
          (object._map && object._map._root) ? (
            object._map._root.entries.map(([key, value]) => (
              <div className="MapEntry" key={key}>
                <div className="key">- {key}:</div>
                <div className="value"><VisualState object={value}/></div>
              </div>
            ))
          ) : null
        }
        {
          // Map
          Map.isMap(object) ? (
            object.toMap().map((value, key) => (
              <div className="MapEntry" key={key}>
                <div className="key">- {key}:</div>
                <div className="value"><VisualState object={value}/></div>
              </div>
            )).toArray()
          ) : null
        }
        {
          // List
          List.isList(object) ? (
            object.toArray().map((value, index) => (
              <div className="ArrayItem" key={index}>
                <div className="index">[{index}]</div>
                <div className="value"><VisualState object={value}/></div>
              </div>
            ))
          ) : null
        }
      </div>
    )
  }

  renderScalar() {
    const { object } = this.props;
    return JSON.stringify(object);
  }

  handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { object } = this.props;
    console.log("clicked on", object);
    window.object = object;
    if (object.toJSON) {
      console.log("- raw", object.toJSON());
      console.log("- json", JSON.stringify(object.toJSON()));
    }
    this.setState({ expanded: !this.state.expanded });
  }
}


export default VisualState;
