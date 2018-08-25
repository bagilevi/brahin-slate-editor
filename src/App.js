import React, { Component } from 'react';
import { Value } from 'slate'
import VisualState from './VisualState'
import CustomEditor from './custom-slate-editor/CustomEditor'
import htmlSerializer from './custom-slate-editor/htmlSerializer'

class App extends Component {
  constructor(props) {
    super(props)
    const { initialHtml } = props;
    const value = Value.fromJSON(htmlSerializer.deserialize(initialHtml, { toJSON: true }));
    this.state = { value }
  }

  componentDidMount() {
    this.customEditorRef.focus();
  }

  render() {
    const { value } = this.state;
    if (!value) return null;
    return (
      <div className="App">
        <div className="horiz">
          <div className="EditorContainer">
            <CustomEditor
              value={value}
              onChange={this.handleEditorChange}
              ref={(ref) => this.customEditorRef = ref}
            />
          </div>
          {
            this.props.showDebugPanes ? (
              <pre className="Json">{JSON.stringify(value.toJSON(), null, 2)}</pre>
            ) : null
          }
          {
            this.props.showDebugPanes ? (
              <div className="VisualState"><VisualState object={value}/></div>
            ) : null
          }
        </div>
      </div>
    );
  }

  handleEditorChange = (editorState) => {
    const { value } = editorState;
    window.value = value;
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(() => htmlSerializer.serialize(value))
    }
  }
}

export default App;
