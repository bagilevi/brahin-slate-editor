import React from 'react';
import EditList from '@bagilevi/slate-edit-list';
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
    change: (change, e, matches) => {
      return change.wrapInList('task_list');
    }
  }),

  {
    onKeyDown: (event, editor, next) => {
      // TODO: try to handle this within the CodeBlock plugin
      if (editor.value.focusBlock.type === 'code_line') return next();

      if (isCreateTaskHotkey(event)) {
        event.preventDefault();
        if (inTask(editor.value)) {
          return editor.unwrapList()
        } else {
          return editor.wrapInList('task_list')
        }
      }
      return next()
    },

    renderNode: (props, editor, next) => {
      const { attributes, children, node } = props
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
      return next()
    },
  }
]

function handleTaskCheckBoxChange(event, { node, editor }) {
  editor.setNodeByKey(node.key, {
    data: node.data.set('completed', !node.data.get('completed'))
  })
}

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
