import React from 'react';
import EditList from 'slate-edit-list';
import AutoReplace from 'slate-auto-replace';
import { isKeyHotkey } from 'is-hotkey'

const isCreateTaskHotkey = isKeyHotkey('mod+k')

const editListPlugin = EditList({ typeDefault: 'paragraph', typeItem: 'task', types: ['task_list'] });

function inTask(value) {
  return value.blocks.some(node => (
    value.document.getParent(node.key).type === 'task'
  ))
}

const plugins = [
  editListPlugin,

  AutoReplace({
    trigger: 'space',
    before: /^(-?\s?\[\s?\])$/,
    transform: (transform, e, matches) => {
      return editListPlugin.changes.wrapInList(transform, 'task_list');
    }
  }),

  {
    onKeyDown: (event, change) => {
      if (isCreateTaskHotkey(event)) {
        event.preventDefault();
        if (inTask(change.value)) {
          return editListPlugin.changes.unwrapList(change)
        } else {
          return editListPlugin.changes.wrapInList(change, 'task_list')
        }
      }
    },

    renderNode: (props) => {
      const { attributes, children, node, editor } = props
      if (node.type === 'task_list') {
        return <div className="task_list" {...attributes}>{children}</div>;
      }
      if (node.type === 'task') {
        return (
          <div className="task" style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
            <div className="task-inner task-checkbox-container" contentEditable={false} style={{ flex: '0 0 18px' }}>
              <input
                type="checkbox"
                checked={node.data.get('completed') ? true : false}
                onChange={(event) => handleTaskCheckBoxChange(event, { node, editor })}
              />
              {" "}
            </div>
            <div className="task-inner task-contents" style={{ flex: '1' }}>
              {children}
            </div>
          </div>
        );
      }
    },
  }
]

function handleTaskCheckBoxChange(event, { node, editor }) {
  const value = editor.state.value;
  const change = value.change().setNodeByKey(node.key, {
    data: node.data.set('completed', !node.data.get('completed'))
  })
  editor.onChange(change);
}


// const BLOCK_TAGS_TO_TYPES = {
//   li: 'list_item',
//   ul: 'ul_list',
//   ol: 'ol_list',
// }
// const BLOCK_TYPES_TO_TAGS = _.invert(BLOCK_TAGS_TO_TYPES);
//
// const isBlankTextNode = (node) => (
//   node.object === 'text' && (
//     node.leaves.length === 0 ||
//       _.every(node.leaves, (leaf) => (
//         /^\s*$/.test(leaf.text)
//       ))
//   )
// )
//
// const ignoreWhitespaceNodes = (nodes) => (
//   _.filter(nodes, (node) => (
//     !isBlankTextNode(node)
//   ))
// )

// // All items of ul_list, ol_list and list_item must be blocks, because of the
// // way `slate-edit-list` was designed.
// const wrapTextNodes = (nodes) => {
//   const newNodes = [];
//   var lastNodeType = null;
//   var lastTextNode = null;
//
//   nodes.forEach((node) => {
//     if (node.object === 'text') {
//       if (lastNodeType === 'text') {
//         // Append to the last text node
//         lastTextNode.leaves = lastTextNode.leaves.concat(node.leaves);
//       }
//       else {
//         // Create a new text node
//         lastTextNode = node;
//         newNodes.push({
//           object: 'block',
//           type: 'div',
//           nodes: [node]
//         })
//       }
//       lastNodeType = 'text';
//     }
//     else {
//       newNodes.push(node);
//       lastNodeType = 'block';
//     }
//   });
//
//   return newNodes;
// }

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      if (el.className === 'task_list') {
        return {
          object: 'block',
          type: 'task_list',
          nodes: next(el.childNodes),
        }
      }
      else if (el.className === 'task') {
        return {
          object: 'block',
          type: 'task',
          data: { completed: el.getAttribute('data-completed') === 'true' },
          nodes: next(el.childNodes)
        }
      }
    },

    serialize(node, children) {
      if (node.type === 'task_list') {
        return (
          <div className="task_list">{children}</div>
        )
      }
      if (node.type === 'task') {
        return (
          <div className="task" style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }} data-completed={node.data.get('completed') ? 'true' : 'false'}>
            <div className="task-inner task-checkbox-container" style={{ flex: '0 0 18px' }}>
              <input
                type="checkbox"
                checked={node.data.get('completed') ? true : false}
                readOnly
              />
              {" "}
            </div>
            <div className="task-inner task-contents" style={{ flex: '1' }}>
              {children}
            </div>
          </div>
        )
      }
    }
  },
]

export default function TaskListPlugin(options) {
  return {
    plugins,
    htmlSerializerRules,
  }
}
