import _ from 'lodash';
import React from 'react';
import EditList from 'slate-edit-list';
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
      return editListPlugin.changes.wrapInList(change, 'ul_list');
    }
  }),

  AutoReplace({
    trigger: 'space',
    before: /^(\d?\.)$/,
    change: (change, e, matches) => {
      return editListPlugin.changes.wrapInList(change, 'ol_list');
    }
  }),

  {
    onKeyDown: (event, change) => {
      if (change.value.focusBlock.type === 'code_line') return;
      if (isCreateBulletListHotkey(event)) {
        event.preventDefault();
        if (inList(change.value)) {
          return editListPlugin.changes.unwrapList(change)
        } else {
          return editListPlugin.changes.wrapInList(change, 'ul_list')
        }
      }
      if (isCreateNumberedListHotkey(event)) {
        event.preventDefault();
        if (inList(change.value)) {
          return editListPlugin.changes.unwrapList(change)
        } else {
          return editListPlugin.changes.wrapInList(change, 'ol_list')
        }
      }
    },

    renderNode: (props) => {
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
    }
  }
]

const BLOCK_TAGS_TO_TYPES = {
  li: 'list_item',
  ul: 'ul_list',
  ol: 'ol_list',
}
const BLOCK_TYPES_TO_TAGS = _.invert(BLOCK_TAGS_TO_TYPES);

const isBlankTextNode = (node) => (
  node.object === 'text' && (
    node.leaves.length === 0 ||
      _.every(node.leaves, (leaf) => (
        /^\s*$/.test(leaf.text)
      ))
  )
)

const ignoreWhitespaceNodes = (nodes) => (
  _.filter(nodes, (node) => (
    !isBlankTextNode(node)
  ))
)

// All items of ul_list, ol_list and list_item must be blocks, because of the
// way `slate-edit-list` was designed.
const wrapTextNodes = (nodes) => {
  const newNodes = [];
  var lastNodeType = null;
  var lastTextNode = null;

  nodes.forEach((node) => {
    if (node.object === 'text') {
      if (lastNodeType === 'text') {
        // Append to the last text node
        lastTextNode.leaves = lastTextNode.leaves.concat(node.leaves);
      }
      else {
        // Create a new text node
        lastTextNode = node;
        newNodes.push({
          object: 'block',
          type: 'div',
          nodes: [node]
        })
      }
      lastNodeType = 'text';
    }
    else {
      newNodes.push(node);
      lastNodeType = 'block';
    }
  });

  return newNodes;
}

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS_TO_TYPES[el.tagName.toLowerCase()]
      if (!block) return;

      var nodes = next(el.childNodes)
      nodes = ignoreWhitespaceNodes(nodes);
      nodes = wrapTextNodes(nodes);

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
