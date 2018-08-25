import _ from 'lodash';
import React from 'react';
import { isKeyHotkey } from 'is-hotkey'

const isEnter = (e) => e.keyCode === 13;

const BuildHeadingPlugin = (blockType, hotKey, render) => {
  return ({ type, key }) => {
    return {
      onKeyDown: (event, change) => {
        if (isKeyHotkey(hotKey)(event)) {
          event.preventDefault();
          change.setBlock(
            change.value.blocks.some(block => block.type === blockType)
            ? 'paragraph'
            : blockType
          );
          return true;
        }
        if (isEnter(event)) {
          // Pressing Enter after a heading => the new line should be a normal paragraph
          if (change.value.startBlock.type.substring(0, 7) === 'heading') {
            event.preventDefault();
            change.splitBlock();
            if (change.value.startBlock.getText() === '') {
              change.setBlock('paragraph');
            }
            return true;
          }
        }
      },
      renderNode: ({ attributes, children, node }) => {
        if (node.type === blockType) {
          return render({ attributes, children });
        }
      }
    }
  }
}

const BLOCK_TAGS_TO_TYPES = {
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  h4: 'heading4',
  h5: 'heading5',
  h6: 'heading6',
}
const BLOCK_TYPES_TO_TAGS = _.invert(BLOCK_TAGS_TO_TYPES);

const htmlSerializerRules = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS_TO_TYPES[el.tagName.toLowerCase()]
      if (!block) return;
      return {
        object: 'block',
        type: block,
        nodes: next(el.childNodes),
      }
    },
    serialize(obj, children) {
      if (obj.object !== 'block') return;
      const tag = BLOCK_TYPES_TO_TAGS[obj.type];
      if (!tag) return;
      return React.createElement(tag, {}, children);
    }
  },
]

export default function HeadingsPlugin(options) {
  return {
    plugins: [
      BuildHeadingPlugin('heading1', 'mod+1', ({ attributes, children }) => <h1 {...attributes}>{children}</h1>)(options),
      BuildHeadingPlugin('heading2', 'mod+2', ({ attributes, children }) => <h2 {...attributes}>{children}</h2>)(options),
      BuildHeadingPlugin('heading3', 'mod+3', ({ attributes, children }) => <h3 {...attributes}>{children}</h3>)(options),
      BuildHeadingPlugin('heading4', 'mod+4', ({ attributes, children }) => <h4 {...attributes}>{children}</h4>)(options),
      BuildHeadingPlugin('heading5', 'mod+5', ({ attributes, children }) => <h5 {...attributes}>{children}</h5>)(options),
      BuildHeadingPlugin('heading6', 'mod+6', ({ attributes, children }) => <h6 {...attributes}>{children}</h6>)(options),
    ],
    htmlSerializerRules,
  }
}
