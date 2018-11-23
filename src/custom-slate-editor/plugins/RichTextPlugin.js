import _ from 'lodash';
import React from 'react';
import { isKeyHotkey } from 'is-hotkey'

const BuildMarkPlugin = (markType, hotKey, render) => {
  return ({ type, key }) => {
    return {
      onKeyDown: (event, editor, next) => {
        if (isKeyHotkey(hotKey)(event)) {
          event.preventDefault();
          return editor.toggleMark(markType);
        }
        return next();
      },
      renderMark: ({ children, mark }, editor, next) => {
        if (mark.type === markType) {
          return render(children);
        }
        return next();
      }
    }
  }
}

const BoldPlugin = BuildMarkPlugin('bold', 'mod+b', (children) => <strong>{children}</strong>);
const ItalicPlugin = BuildMarkPlugin('italic', 'mod+i', (children) => <em>{children}</em>);
const UnderlinePlugin = BuildMarkPlugin('underline', 'mod+u', (children) => <u>{children}</u>);
const CodePlugin = BuildMarkPlugin('code', 'mod+h', (children) => <code>{children}</code>);

const MARK_TAGS_TO_TYPES = {
  strong: 'bold',
  b: 'bold',
  em: 'italic',
  i: 'italic',
  u: 'underline',
  code: 'code',
}
const MARK_TYPES_TO_TAGS = _.invert(MARK_TAGS_TO_TYPES);

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      const mark = MARK_TAGS_TO_TYPES[el.tagName.toLowerCase()]
      if (!mark) return
      return {
        object: 'mark',
        type: mark,
        nodes: next(el.childNodes),
      }
    },
    serialize(obj, children) {
      if (obj.object !== 'mark') return;
      const tag = MARK_TYPES_TO_TAGS[obj.type];
      if (!tag) return;
      return React.createElement(tag, {}, children);
    }
  },
]


export default function RichTextPlugin(options) {
  return {
    plugins: [
      BoldPlugin(options),
      ItalicPlugin(options),
      UnderlinePlugin(options),
      CodePlugin(options),
    ],
    htmlSerializerRules,
  }
}
