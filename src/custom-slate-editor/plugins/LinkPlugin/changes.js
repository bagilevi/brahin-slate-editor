import { buildLinkJson } from './model'

function insertLink(editor, linkProps) {
  const linkJson = buildLinkJson(linkProps)
  console.log('linkJson', linkJson)
  var c = editor.insertInline(linkJson)
  c.moveToStartOfNextText()
  c.focus()
}

function updateLink(editor, node, linkProps) {
  const { href } = linkProps
  if (href) {
    editor.replaceNodeByKey(
      node.key,
      buildLinkJson(linkProps),
    )
    editor.focus()
  }
  else {
    unwrapLink(editor)
  }
}

function insertRawLink(editor, href) {
  insertLink(editor, { href })
}

function makeLinkFromSelection(editor, href) {
  const { value } = editor
  const { fragment } = value
  if (hasLinks(value)) {
    editor.command(unwrapLink)
  }

  editor.wrapInline(
    buildLinkJson({ href, label: fragment.text }),
  )
}

function hasLinks(value) {
  return value.inlines.some(inline => inline.type === 'link')
}

function unwrapLink(editor) {
  editor.unwrapInline('link')
}

export {
  insertLink,
  updateLink,
  insertRawLink,
  makeLinkFromSelection,
}
