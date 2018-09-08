import React from 'react'
import env from '../../env'
import { getLinkHref } from './model'

function renderNode({ attributes, children, node, isSelected }) {
  if (node.type === 'link') {
    attributes.className = `${attributes.className || ''} ${(isSelected ? 'active' : '')} link`
    return (
      <a
        href={getLinkHref(node)}
        onClick={(event) => handleLinkClick(event, node)}
        {...attributes}
      >
        {children}
      </a>
    )
  }
}

function handleLinkClick(event, node) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    // let it propagate
  }
  else {
    event.preventDefault();
    event.stopPropagation();
    env.linking.followLink({ href: getLinkHref(node) })
  }
}

export {
  renderNode,
}
