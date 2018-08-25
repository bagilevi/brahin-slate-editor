import React from 'react';
import { getEventTransfer } from 'slate-react';
import isUrl from 'is-url';
import { isHotkey, isKeyHotkey } from 'is-hotkey'
import env from '../env'
import { Text } from 'slate'

const isInsertLinkHotkey = isKeyHotkey('mod+shift+l')
const isCreateChildPageHotkey = isKeyHotkey('mod+shift+i')
const isEditLinkHotkey = isHotkey('mod+e')

function hasLinks(value) {
  return value.inlines.some(inline => inline.type === 'raw_link' || inline.type === 'link')
}

function unwrapLink(change) {
  change.unwrapInline('raw_link')
  change.unwrapInline('link')
}

function wrapLink(change, href) {
  change.wrapInline({
    type: 'link',
    data: { href: href },
  })
}

function insertRawLink(change, href) {
  change.insertInline({ type: 'raw_link', isVoid: true, data: { href: href } })
    .collapseToStartOfNextText()
    .focus()
}

function handleLinkClick(event, node) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    // let it propagate
  }
  else {
    event.preventDefault();
    event.stopPropagation();
    const url = node.data.get('href')
    env.linking.followLink({ href: url })
  }
}

const plugins = [
  {
    onPaste(event, change) {
      const transfer = getEventTransfer(event)
      const { value } = change
      const { text } = transfer
      if (transfer.type !== 'text' && transfer.type !== 'html') return
      if (!isUrl(text)) return
      const href = text;

      if (value.isCollapsed) {
        change.call(insertRawLink, href)
      }
      else {
        if (hasLinks(value)) {
          change.call(unwrapLink)
        }
        change.call(wrapLink, text)
      }

      change.collapseToEnd()

      return change
    },

    renderNode: ({ attributes, children, node, isSelected }) => {
      if (node.type === 'link' || node.type === 'raw_link') {
        const href = node.data.get('href')
        attributes.className = `${attributes.className || ''} ${(isSelected ? 'active' : '')} link`
        return (
          <a
            href={href}
            onClick={(event) => handleLinkClick(event, node)}
            {...attributes}
          >
            {node.type === 'link' ? children : href}
          </a>
        )
      }
    },

    onKeyDown: (event, change, editor) => {
      if (isHotkey('enter', event) || isHotkey('space', event)) {
        const { value } = change
        const { startText, startOffset } = value
        const { text } = startText
        const string = text.slice(0, startOffset)
        const matches = string.match(/(^|\s)(https?:\/\/[^\s]+)$/)

        if (matches && matches.length) {
          const url = matches[2]
          change.moveOffsetsTo(startOffset - url.length, startOffset)
          change.call(insertRawLink, url)
        }
        return
      }

      function insertLink({ href, label }) {
        editor.change((change) => {
          if (label) {
            change.insertInline({
              type: 'link',
              isVoid: false,
              data: { href: href },
              nodes: [Text.create(label)]
            })
            .collapseToStartOfNextText()
            .focus()
          } else {
            change.call(insertRawLink, href);
          }
        })
        // Automatically go to the new page - useful if the user intends to create a new wiki page.
        env.linking.followLink({ href: href, label: label }, { ifNewResource: true })
      }

      if (isInsertLinkHotkey(event)) {
        event.preventDefault();
        env.linking.getLinkPropertiesForInsertion().then(insertLink);
        return
      }

      if (isCreateChildPageHotkey(event)) {
        event.preventDefault();

        env.linking.getLinkPropertiesForInsertion({ mode: 'create_child' }).then(insertLink);
        return
      }

      if (isEditLinkHotkey(event)) {
        event.preventDefault();
        const { value } = change
        const node = value.inlines.find(inline => inline.type === 'link' || inline.type === 'raw_link')
        if (!node) return

        const href = node.data.get('href')

        env.ui.prompt('Enter the new URL for the link:', href)
          .then((newHref) => { updateLinkHref(editor, node, newHref) })
          .catch((err) => { editor.focus() })
      }
    },
  },
]

function updateLinkHref(editor, node, newHref) {
  editor.change((change) => {
    if (newHref) {
      change.setNodeByKey(node.key, { data: { href: newHref } })
      change.focus()
    }
    else {
      unwrapLink(change)
    }
  })
}

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      if (el.tagName !== 'A') return;

      return {
        object: 'inline',
        type: 'link',
        data: { href: el.getAttribute('href') },
        nodes: next(el.childNodes),
      }
    },

    serialize(node, children) {
      if (node.type === 'link' || node.type === 'raw_link') {
        const href = node.data.get('href')
        return (
          <a href={href} >
            {node.type === 'link' ? children : href}
          </a>
        )
      }
    }
  }
]


export default function LinkPlugin(options) {
  return {
    plugins,
    htmlSerializerRules
  }
}
