import { getEventTransfer } from 'slate-react'
import isUrl from 'is-url'
import { insertRawLink, makeLinkFromSelection } from './changes'

function onPaste(event, change) {
  const transfer = getEventTransfer(event)
  console.log('paste:', transfer)
  const { value } = change
  const { selection } = value
  const { text } = transfer
  if (transfer.type !== 'text' && transfer.type !== 'html') return
  if (!isUrl(text)) return
  const href = text;

  console.log('selection.isCollapsed', selection.isCollapsed)

  if (selection.isCollapsed) {
    console.log('insertRawLink', href)
    change.call(insertRawLink, href)
  }
  else {
    change.call(makeLinkFromSelection, href)
  }

  change.moveToEnd()

  return change
}

export {
  onPaste,
}
