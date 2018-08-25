import React, { Component } from 'react';
import './CustomEditor.css';
import { Editor } from 'slate-react'
import AggregatePlugin from './plugins'

class CustomEditor extends Component {
  constructor(props) {
    super(props);
    this.aggregatePlugin = AggregatePlugin({ oneLine: props.oneLine })
  }

  render() {
    return (
      <div className="EditorContainer">
        <Editor
          value={this.props.value}
          onChange={this.handleChange}
          plugins={this.aggregatePlugin.plugins}
          readOnly={this.props.readOnly}
          placeholder={this.props.placeholder}
          ref={(editorRef) => this.editorRef = editorRef}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
        />
      </div>
    );
  }

  // Public
  focus() {
    this.editorRef.focus();
  }

  handleChange = (value) => {
    this.props.onChange(value)
  }
}

export default CustomEditor
