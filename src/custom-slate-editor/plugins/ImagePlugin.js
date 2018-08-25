/*

  This plugin is unused because too much extra work is needed to make it work properly.

  Feature creep / bugs:

    * bug: dropping image does not work in the main app
    * store the image file separately instead of Base64-encoding it
    * resizing - idea: use +/- keys
    * bug: inserting images sometimes seems to insert it into the contenteditable without triggering slate
    * bug: cut-paste a single image doesn't work (but it works when you cut a larger segment)

*/
import React from 'react';
import { Block } from 'slate'
import { getEventRange, getEventTransfer } from 'slate-react'
import { LAST_CHILD_TYPE_INVALID } from 'slate-schema-violations'
import { isKeyHotkey } from 'is-hotkey'
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import env from '../env';

const isInsertImageHotkey = isKeyHotkey('mod+shift+i')

function isImage(url) {
  return !!imageExtensions.find(url.endsWith)
}

function insertImage(change, src, target) {
  if (target) {
    change.select(target)
  }

  change.insertBlock({
    type: 'image',
    isVoid: true,
    data: { src },
  })
}

const plugins = [
  {
    onKeyDown: (event, change, editor) => {
      if (isInsertImageHotkey(event)) {
        event.preventDefault();
        env.ui.prompt('Enter the URL of the image:').then((src) => {
          if (!src) return
          editor.change((change) => {
            insertImage(change, src, change.value.selection)
          })
        })
      }
    },

    renderNode: props => {
      const { attributes, node, isSelected } = props
      if (node.type === 'image') {
        const src = node.data.get('src')
        const className = isSelected ? 'active' : null
        const style = { display: 'block' }
        return (
          <img src={src} alt="" className={className} style={style} {...attributes} />
        )
      }
    },

    schema: {
      document: {
        // A schema to enforce that there's always a paragraph as the last block.
        last: { types: ['paragraph'] },
        normalize: (change, reason, { node, child }) => {
          if (reason === LAST_CHILD_TYPE_INVALID) {
            const paragraph = Block.create('paragraph')
            return change.insertNodeByKey(node.key, node.nodes.size, paragraph)
          }
        },
      },
    },

    onDrop: (event, change, editor) => {
      // console.log('dropped')
      const target = getEventRange(event, change.value)
      if (!target && event.type === 'drop') return

      const transfer = getEventTransfer(event)
      const { type, text, files } = transfer

      if (type === 'files') {
        for (const file of files) {
          const reader = new FileReader()
          const [mime] = file.type.split('/')
          if (mime !== 'image') continue

          reader.addEventListener('load', () => {
            editor.change(change => {
              change.call(insertImage, reader.result, target)
            })
          })

          reader.readAsDataURL(file)
        }
      }

      if (type === 'text') {
        if (!isUrl(text)) return
        if (!isImage(text)) return
        change.call(insertImage, text, target)
      }
    }
  }
]

export default function ImagePlugin(options) {
  return {
    plugins,
  }
}
