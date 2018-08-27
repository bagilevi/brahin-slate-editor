import React from 'react';
import { getEventTransfer } from 'slate-react';
import isUrl from 'is-url';
import { isHotkey, isKeyHotkey } from 'is-hotkey'
import env from '../env'

const isInsertLinkHotkey = isKeyHotkey('mod+shift+l')
const isCreateChildPageHotkey = isKeyHotkey('mod+shift+i')
const isEditLinkHotkey = isHotkey('mod+e')

function hasLinks(value) {
  return value.inlines.some(inline => inline.type === 'link')
}

function unwrapLink(change) {
  change.unwrapInline('link')
}

function wrapLink(change, href) {
  change.wrapInline({
    type: 'link',
    data: { href: href },
  })
}

function insertRawLink(change, href) {
  change.insertInline({ type: 'link', isVoid: true, data: { href: href } })
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
      if (node.type === 'link') {
        const href = node.data.get('href')
        const label = node.data.get('label')
        attributes.className = `${attributes.className || ''} ${(isSelected ? 'active' : '')} link`
        return (
          <a
            href={href}
            onClick={(event) => handleLinkClick(event, node)}
            {...attributes}
          >
            {node.isVoid ? (label || href) : children}
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
              data: { href: href, label: label },
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
        const node = value.inlines.find(inline => inline.type === 'link')
        if (!node) return

        env.ui.prompt('New URL/href', node.data.get('href'))
          .then((newHref) => {
            return env.ui.prompt('New label', node.data.get('label'))
              .then((newLabel) => ({ href: newHref, label: newLabel }))
          })
          .then((newLinkProps) => {
            updateLink(editor, node, newLinkProps)
          })
          .catch((err) => { console.error(err); editor.focus() })
      }
    },
  },
]

function updateLink(editor, node, { href, label }) {
  const wasVoid = node.isVoid;
  const isVoid = !label;
  console.log('href', href, 'label', label, 'void', wasVoid, '=>', isVoid);
  editor.change((change) => {
    if (href) {
      change.setNodeByKey(
        node.key,
        {
          isVoid: true,
          data: { href: href, label: label },
        }
      )
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
        isVoid: true,
        data: {
          href: el.getAttribute('href'),
          label: (el.text === el.getAttribute('href') ? undefined : el.text)
        },
        // TODO: what if the child element is not a text?
      }
    },

    serialize(node, children) {
      if (node.type === 'link') {
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
