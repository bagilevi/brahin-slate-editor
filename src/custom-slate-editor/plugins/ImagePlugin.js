import React from 'react';
import { Block } from 'slate'
import { getEventRange, getEventTransfer } from 'slate-react'
import { isKeyHotkey } from 'is-hotkey'
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import env from '../env';

const isInsertImageHotkey = isKeyHotkey('mod+shift+m')

const imageStyle = (node, selected) => {
  return {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '50em',
    outline: (selected ? 'double 3px #000' : 'none'),
    zIndex: (selected ? 999 : null),
  }
}

function isImage(url) {
  return !!imageExtensions.find(ext => url.endsWith(ext))
}

const Image = props => (
  <img
    alt=""
    style={imageStyle(props.node, props.selected)}
    {...props}
  />
)

function getBlankBlock(value) {
  if (!value.selection.start.key) return null
  const block = value.startBlock
  if (block.text === '') return block
}

function insertImage(change, editor, src, target) {
  if (target) {
    change.select(target)
  }

  const blankBlock = getBlankBlock(editor.value)

  if (blankBlock) {
    change.replaceNodeByKey(
      blankBlock.key,
      {
        object: 'block',
        type: 'image',
        data: { src },
      }
    )
  }
  else {
    change.insertBlock({
      type: 'image',
      data: { src },
    })
  }
}

function updateImage(change, node, src) {
  change.replaceNodeByKey(
    node.key,
    {
      object: 'block',
      type: 'image',
      data: { src },
    }
  )
}

const plugins = [
  {
    onKeyDown: (event, editor, next) => {
      if (isInsertImageHotkey(event)) {
        event.preventDefault();
        env.ui.prompt('Enter the URL of the image:').then((src) => {
          if (!src) return next()
          editor.command(insertImage, editor, src)
        })
      }
      return next()
    },

    renderNode: (props, editor, next) => {
      const { attributes, node, isSelected, isFocused } = props
      if (node.type === 'image') {
        const src = node.data.get('src')
        return (
          <Image
            src={src}
            alt=""
            node={node}
            selected={isFocused || isSelected}
            onDoubleClick={handleEdit.bind(this, editor, node)}
            {...attributes}
          />
        )
      }
      return next()
    },

    onDrop: handleDropOrPaste,
    onPaste: handleDropOrPaste,
  }
]

function handleDropOrPaste(event, editor, next) {
  console.log('handleDropOrPaste')
  const target = getEventRange(event, editor)
  if (!target && event.type === 'drop') return next()

  const transfer = getEventTransfer(event)
  const { type, text, files } = transfer

  if (type === 'files') {
    for (const file of files) {
      const [mime] = file.type.split('/')
      if (mime !== 'image') continue

      env.storage.saveFile(file).then(({ url }) => {
        editor.command(insertImage, editor, url, target)
      })
    }
  }

  if (type === 'text' || type === 'html') {
    const url = '' + text
    if (!isUrl(url)) return
    if (!isImage(url)) return
    editor.command(insertImage, editor, url, target)
  }

  return next()
}


function handleEdit(editor, node, event) {
  event.preventDefault();
  const oldSrc = node.data.get('src')
  env.ui.prompt('Image URL:', oldSrc).then((src) => {
    if (!src || src === oldSrc) return
    editor.command(updateImage, node, src)
  })
}

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      if (el.tagName !== 'IMG') return

      const src = el.getAttribute('src')

      return {
        object: 'block',
        type: 'image',
        data: { src }
      }
    },

    serialize(node, children) {
      if (node.type !== 'image') return;
      return (
        <img
          src={node.data.get('src')}
          alt=""
          style={imageStyle(node, false)} />
      )
    }
  },
]

const addToSchema = (schema) => {
  schema.blocks.image = {
    isVoid: true,
  }

  schema.document = {
    last: { type: 'paragraph' },
    normalize: (change, { code, node, child }) => {
      if (code === 'last_child_type_invalid') {
        const paragraph = Block.create('paragraph')
        return change.insertNodeByKey(node.key, node.nodes.size, paragraph)
      }
    },
  }
}

export default function ImagePlugin(options) {
  return {
    plugins,
    htmlSerializerRules,
    addToSchema
  }
}
