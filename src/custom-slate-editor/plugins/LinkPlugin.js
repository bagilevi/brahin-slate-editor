import { renderNode } from './LinkPlugin/rendering'
import { htmlSerializerRules } from './LinkPlugin/html-serialization'
import { onPaste } from './LinkPlugin/pasting'
import { onKeyDown } from './LinkPlugin/keypress'

const plugins = [
  {
    onPaste,
    renderNode,
    onKeyDown,
  },
]

const addToSchema = (schema) => {
  schema.inlines.link = {
    isVoid: false,

    nodes: [
      {
        match: [{ text: /^.+$/ }], // Link must have a label
      }
    ],

    normalize: (change, { code, node, child }) => {
      if (code === 'child_text_invalid') {
        // If the link doesn't have a label => delete it
        // This can happen when we press Backspace on the last character or
        // Ctrl+X the whole link.
        return change.removeNodeByKey(node.key)
      }
    }
  }
}

export default function LinkPlugin(options) {
  return {
    plugins,
    htmlSerializerRules,
    addToSchema,
  }
}
