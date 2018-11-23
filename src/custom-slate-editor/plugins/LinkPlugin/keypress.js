import { insertLink, updateLink, insertRawLink } from './changes'
import { isHotkey, isKeyHotkey } from 'is-hotkey'
import env from '../../env'
import { getLinkHref, getLinkLabelForEditing } from './model'

const isInsertLinkHotkey = isKeyHotkey('mod+shift+l')
const isCreateChildPageHotkey = isKeyHotkey('mod+shift+i')
const isEditLinkHotkey = isHotkey('mod+e')

function onKeyDown(event, editor, next) {
  if (isHotkey('enter', event) || isHotkey('space', event)) {
    const { value } = editor
    const { startText, startOffset } = value
    const { text } = startText
    const string = text.slice(0, startOffset)
    const matches = string.match(/(^|\s)(https?:\/\/[^\s]+)$/)

    if (matches && matches.length) {
      const url = matches[2]
      editor.moveAnchorBackward(url.length)
      editor.command(insertRawLink, url)
      return true
    }
    return next()
  }

  if (isInsertLinkHotkey(event)) {
    event.preventDefault()
    env.linking.getLinkPropertiesForInsertion().then(linkProps => {
      editor.command(insertLink, linkProps)
    })
    return next()
  }

  if (isCreateChildPageHotkey(event)) {
    event.preventDefault()

    env.linking.getLinkPropertiesForInsertion({ mode: 'create_child' }).then(linkProps => {
      editor.command(insertLink, linkProps)
      // Automatically go to the new page - useful if the user intends to create a new wiki page.
      env.linking.followLink(linkProps, { ifNewResource: true })
    })
    return next()
  }

  if (isEditLinkHotkey(event)) {
    event.preventDefault()
    const { value } = editor
    const node = value.inlines.find(inline => inline.type === 'link')
    if (!node) return

    env.ui.prompt('New URL/href', getLinkHref(node))
      .then((newHref) => {
        return env.ui.prompt('New label', getLinkLabelForEditing(node))
          .then((newLabel) => ({ href: newHref, label: newLabel }))
      })
      .then((newLinkProps) => {
        editor.command(updateLink, node, newLinkProps)
      })
      .catch((err) => { console.error(err); editor.focus() })
  }
  return next()
}

export {
  onKeyDown,
}
