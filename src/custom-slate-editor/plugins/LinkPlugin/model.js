// Raw links:
// A raw link is a link where the label is the same as the URL.
// You can create a raw link by pasting a URL when there's no selection.
// Raw links are represented internally by a `link` inline type
// with `href` set to null and `isRaw` set to true, while the child
// text node contains the URL. This way the user can edit the URL within
// the editor, and the URL will form part of any `node.text`.

function buildLinkJson({ href, label }) {
  const isRaw = isBlank(label) || href === label

  if (isRaw) {
    return buildRawLinkJson({ href })
  }

  return {
    object: 'inline',
    type: 'link',
    data: {
      isRaw: false,
      href: href,
    },
    nodes: [
      {
        object: 'text',
        text: label,
      }
    ]
  }
}

function buildRawLinkJson({ href }) {
  return {
    object: 'inline',
    type: 'link',
    data: {
      isRaw: true,
      href: null,
    },
    nodes: [
      {
        object: 'text',
        text: href,
      }
    ]
  }
}

function getLinkHref(node) {
  const isRaw = node.data.get('isRaw')
  if (isRaw) {
    return node.text
  }
  else {
    return node.data.get('href')
  }
}

function getLinkLabelForEditing(node) {
  const isRaw = node.data.get('isRaw')
  if (isRaw) {
    return ''
  }
  else {
    return node.text
  }
}

function getLinkLabelToDisplay(node) {
  const isRaw = node.data.get('isRaw')
  if (isRaw) {
    return node.text
  }
  else {
    return node.text
  }
}

function isBlank(str) {
  return !str || str.length === 0
}

export {
  buildLinkJson,
  getLinkHref,
  getLinkLabelForEditing,
  getLinkLabelToDisplay,
}
