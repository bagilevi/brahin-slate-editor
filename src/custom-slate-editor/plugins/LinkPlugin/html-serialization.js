import React from 'react'
import { buildLinkJson } from './model'

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
        const href = node.data.get('href')
        const label = node.data.get('label') || href
        return (
          <a href={href}>{label}</a>
        )
      }
    }
  }
]

export {
  htmlSerializerRules
}
