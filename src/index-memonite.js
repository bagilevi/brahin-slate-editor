import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { setEnv } from './custom-slate-editor/env'
import mockEnv from './mockEnv'

window.define(() => ((Memonite) => {

  const env = _.defaultsDeep(Memonite, mockEnv);
  setEnv(env)

  return {
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

}))
