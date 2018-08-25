import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import './App.css';
import { setEnv } from './custom-slate-editor/env'
import mockEnv from './mockEnv'

// const initialHtml = "<h1>Hello</h1><p>Hi everybody!</p>";
// const initialHtml = '<h1>Testsasjdfjgdf</h1><p>Ok this seems to work.!!!! YEAY!!!</p><ul><li><p>fsdkhflkasd</p></li><li><p><a href="http://localhost:3000/another">another-page s</a></p></li></ul>'

const initialHtml = `
<div>
  <div class="task_list">
    <div class="task" style="display:flex;flex-direction:row;align-items:baseline" data-completed="false">
      <div class="task-inner task-checkbox-container" style="flex:0 0 18px">
        <input type="checkbox" readonly="" /> </div>
      <div class="task-inner task-contents" style="flex:1">
        <p>a</p>
      </div>
    </div>
    <div class="task" style="display:flex;flex-direction:row;align-items:baseline" data-completed="true">
      <div class="task-inner task-checkbox-container" style="flex:0 0 18px">
        <input type="checkbox" readonly="" checked="checked" /> </div>
      <div class="task-inner task-contents" style="flex:1">
        <p>b</p>
      </div>
    </div>
  </div>
</div>
`

setEnv(mockEnv);

ReactDOM.render(
  <App
    initialHtml={initialHtml}
    onChange={console.log}
    showDebugPanes={true}
  />,
  document.getElementById('root')
);
