import React from 'react';

const plugins = [
  {
    renderNode: (props, editor, next) => {
      const { node, attributes, children } = props;
      switch (node.type) {
        case 'paragraph':
          return <p {...attributes}>{children}</p>;
        default:
          return next();
      }
    }
  }
]

const htmlSerializerRules = [
  {
    serialize(node, children) {
      if (node.type !== 'paragraph') return;
      return (
        <p>{children}</p>
      )
    }
  },
]


export default function ParagraphPlugin(options) {
  return {
    plugins,
    htmlSerializerRules
  }
}
