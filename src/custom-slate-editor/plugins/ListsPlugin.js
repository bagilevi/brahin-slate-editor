import _ from 'lodash';
import React from 'react';
import EditList from '@bagilevi/slate-edit-list';
import AutoReplace from 'slate-auto-replace';
import { isKeyHotkey } from 'is-hotkey'

const isCreateBulletListHotkey = isKeyHotkey('mod+l')
const isCreateNumberedListHotkey = isKeyHotkey('mod+shift+n')

const editListPlugin = EditList({ typeDefault: 'paragraph' });

function inList(value) {
  return value.blocks.some(node => (
    value.document.getParent(node.key).type === 'list_item'
  ))
}

const plugins = [
  editListPlugin,

  AutoReplace({
    trigger: 'space',
    before: /^(\*|-)$/,
    change: (change, e, matches) => {
      return change.wrapInList('ul_list');
    }
  }),

  AutoReplace({
    trigger: 'space',
    before: /^(\d?\.)$/,
    change: (change, e, matches) => {
      return change.wrapInList('ol_list');
    }
  }),

  {
    onKeyDown: (event, editor, next) => {
      // TODO: try to handle this within the CodeBlock plugin
      if (editor.value.focusBlock.type === 'code_line') return next();

      if (isCreateBulletListHotkey(event)) {
        event.preventDefault();
        if (inList(editor.value)) {
          return editor.unwrapList()
        } else {
          return editor.wrapInList('ul_list')
        }
      }
      if (isCreateNumberedListHotkey(event)) {
        event.preventDefault();
        if (inList(editor.value)) {
          return editor.unwrapList()
        } else {
          return editor.wrapInList('ol_list')
        }
      }
      next();
    },

    renderNode: (props, editor, next) => {
      const { attributes, children, node } = props

      if (node.type === 'ul_list') {
        return <ul {...attributes}>{children}</ul>;
      }
      if (node.type === 'ol_list') {
        return <ol {...attributes}>{children}</ol>;
      }
      if (node.type === 'list_item') {
        return <li {...attributes}>{children}</li>;
      }
      return next()
    }
  }
]

const BLOCK_TAGS_TO_TYPES = {
  li: 'list_item',
  ul: 'ul_list',
  ol: 'ol_list',
}
const BLOCK_TYPES_TO_TAGS = _.invert(BLOCK_TAGS_TO_TYPES);

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS_TO_TYPES[el.tagName.toLowerCase()]
      if (!block) return;

      var nodes = next(el.childNodes)

      return {
        object: 'block',
        type: block,
        nodes: nodes,
      }
    },

    serialize(obj, children) {
      if (obj.object !== 'block') return;
      const tag = BLOCK_TYPES_TO_TAGS[obj.type];
      if (!tag) return;
      return React.createElement(tag, {}, children);
    }
  },
]

export default function ListsPlugin(options) {
  return {
    plugins,
    htmlSerializerRules,
  }
}
