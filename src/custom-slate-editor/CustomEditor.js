import React, { Component } from 'react';
import './CustomEditor.css';
import { Editor, getEventTransfer } from 'slate-react'
import AggregatePlugin from './plugins'
import htmlSerializer from './htmlSerializer'


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
          onPaste={this.handlePaste}
          plugins={this.aggregatePlugin.plugins}
          schema={this.aggregatePlugin.schema}
          readOnly={this.props.readOnly}
          placeholder={this.props.placeholder}
          ref={(editorRef) => this.editorRef = editorRef}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
          autoCorrect={false}
          spellCheck={false}
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

  handlePaste = (event, change, next) => {
    const transfer = getEventTransfer(event)
    if (transfer.type !== 'html') return next()
    const { document } = htmlSerializer.deserialize(transfer.html)
    change.insertFragment(document)
    return next()
  }
}

export default CustomEditor
