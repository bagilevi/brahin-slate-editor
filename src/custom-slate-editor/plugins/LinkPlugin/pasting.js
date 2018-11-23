import { getEventTransfer } from 'slate-react'
import isUrl from 'is-url'
import { insertRawLink, makeLinkFromSelection } from './changes'

function onPaste(event, editor, next) {
  const transfer = getEventTransfer(event)
  console.log('paste:', transfer)
  const { value } = editor
  const { selection } = value
  const { text } = transfer
  if (!isUrl(text)) return next()
  const href = text;

  console.log('selection.isCollapsed', selection.isCollapsed)

  if (selection.isCollapsed) {
    console.log('insertRawLink', href)
    editor.command(insertRawLink, href)
  }
  else {
    editor.command(makeLinkFromSelection, href)
  }

  editor.moveToEnd()

  return true
}

export {
  onPaste,
}
