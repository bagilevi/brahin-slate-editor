import { buildLinkJson } from './model'

function insertLink(change, linkProps) {
  var c = change.insertInline(buildLinkJson(linkProps))
  c.moveToStartOfNextText()
  c.focus()
}

function updateLink(change, node, linkProps) {
  const { href } = linkProps
  if (href) {
    change.replaceNodeByKey(
      node.key,
      buildLinkJson(linkProps),
    )
    change.focus()
  }
  else {
    unwrapLink(change)
  }
}

function insertRawLink(change, href) {
  insertLink(change, { href })
}

function makeLinkFromSelection(change, href) {
  const { value } = change
  const { fragment } = value
  if (hasLinks(value)) {
    change.call(unwrapLink)
  }

  change.wrapInline(
    buildLinkJson({ href, label: fragment.text}),
  )
}

function hasLinks(value) {
  return value.inlines.some(inline => inline.type === 'link')
}

function unwrapLink(change) {
  change.unwrapInline('link')
}

export {
  insertLink,
  updateLink,
  insertRawLink,
  makeLinkFromSelection,
}
