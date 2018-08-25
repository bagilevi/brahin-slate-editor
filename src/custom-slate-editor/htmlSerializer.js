import _ from 'lodash';
import React from 'react';
import Html from 'slate-html-serializer'
import AggregatePlugin from 'custom-slate-editor/plugins'

const isBlank = (obj) => {
  const raw = obj.toJSON();
  if (raw.nodes.length === 0) return true;
  if (raw.nodes.length > 0) return false;
  const node = raw.nodes[0];
  if (node.object === 'text' && isTextNodeBlank(node)) return true;
  return false;
}

const isTextNodeBlank = (node) => {
  return node.leaves.length === 1 && node.leaves[0].text === '';
}

const textRule = {
  deserialize(el) {
    if (el.tagName && el.tagName.toLowerCase() === 'br') {
      return {
        object: 'text',
        leaves: [
          {
            object: 'leaf',
            text: '\n',
          },
        ],
      }
    }

    if (el.nodeName === '#text') {
      if (el.nodeValue && el.nodeValue.match(/<!--.*?-->/)) return null;
      if (el.nodeValue.trim() === '') return null;

      return {
        object: 'text',
        leaves: [
          {
            object: 'leaf',
            text: el.nodeValue.replace(/\s+/g, ' '),
          },
        ],
      }
    }
  },

  serialize(obj, children) {
    if (obj.object === 'string') {
      return children.split('\n').reduce((array, text, i) => {
        if (i !== 0) array.push(<br />)
        array.push(text);
        return array;
      }, [])
    }
  },
}


const divRule = {
  deserialize(el, next) {
    if (el.tagName.toLowerCase() === 'div' && el.className === 'div') {
      return {
        object: 'block',
        type: 'div',
        nodes: next(el.childNodes),
      }
    }
  },
  serialize(obj, children) {
    if (obj.object === 'block' && obj.type === 'div') {
      if (isBlank(obj)) {
        return <br/>
      }
      else {
        return <div class="div">{children}</div>
      }
    }
  },
}

const paragraphRule = {
  deserialize(el, next) {
    if (el.tagName.toLowerCase() === 'p') {
      return {
        object: 'block',
        type: 'paragraph',
        nodes: next(el.childNodes),
      }
    }
  },
  serialize(obj, children) {
    if (obj.object === 'block' && obj.type === 'paragraph') {
      return <p>{children}</p>
    }
  },
}

const lineRule = {
  deserialize(el, next) {
    if (el.tagName.toLowerCase() === 'div' && el.className === 'line') {
      return {
        object: 'block',
        type: 'line',
        nodes: next(el.childNodes),
      }
    }
  },
  serialize(obj, children) {
    if (obj.object === 'block' && obj.type === 'line') {
      if (obj.text.trim() === '') {
        return <br/>
      }
      else {
        return <div class="line">{children}</div>
      }
    }
  },
}

const coreRules = [
  textRule,
  divRule,
  paragraphRule,
  lineRule,
]
const pluginRules = AggregatePlugin().htmlSerializerRules

const htmlSerializer = new Html({ defaultBlock: 'div', rules: _.concat(coreRules, pluginRules) })

export default htmlSerializer;
