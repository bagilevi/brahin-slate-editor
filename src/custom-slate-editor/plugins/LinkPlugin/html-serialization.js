import React from 'react'
import { buildLinkJson, getLinkHref, getLinkLabel } from './model'

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      if (el.tagName !== 'A') return

      const href = el.getAttribute('href')
      const label = el.text

      // TODO: what if the child element is not a text?

      return buildLinkJson({ href, label })
    },

    serialize(node, children) {
      if (node.type === 'link') {
        return (
          <a href={getLinkHref(node)}>{getLinkLabel(node)}</a>
        )
      }
    }
  }
]

export {
  htmlSerializerRules
}
