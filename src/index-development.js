import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import './App.css';
import { setEnv } from './custom-slate-editor/env'
import mockEnv from './mockEnv'

var initialHtml = '<h1>Hello</h1><p>Hi everybody!</p>'

// Read initialHtml from .gitignore'd module
try {
  initialHtml = require('./initialHtml').default
}
catch (e) {
  console.warn('initialHtml could not be loaded', e)
}

setEnv(mockEnv);

ReactDOM.render(
  <App
    initialHtml={initialHtml}
    showStatePane={false}
    showJsonPane={false}
    showHtmlPane={false}
  />,
  document.getElementById('root')
);
