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
  }
}

export default function LinkPlugin(options) {
  return {
    plugins,
    htmlSerializerRules,
    addToSchema,
  }
}
