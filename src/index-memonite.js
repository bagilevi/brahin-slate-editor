import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { setEnv } from './custom-slate-editor/env'
import mockEnv from './mockEnv'

const Memonite = window.Memonite;
const env = _.defaultsDeep(Memonite, mockEnv);
setEnv(env)

console.log('memonite-slate: setting Memonite.editors["memonite-slate-editor-v1"]')
window.Memonite.editors['memonite-slate-editor-v1'] = {
  init: (el, onChange) => {
    ReactDOM.render(
      <App
        initialHtml={el.html()}
        onChange={onChange}
      />,
      el.get(0)
    );
  }
}
