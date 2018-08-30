import _ from 'lodash';

import ParagraphPlugin from './plugins/ParagraphPlugin';
import RichTextPlugin from './plugins/RichTextPlugin';
import HeadingsPlugin from './plugins/HeadingsPlugin';
import ListsPlugin from './plugins/ListsPlugin';
import TaskListPlugin from './plugins/TaskListPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import OneLinePlugin from './plugins/OneLinePlugin';

const pluginConstructors = {
  rich: [
    ParagraphPlugin,
    LinkPlugin, // must be in front, so that other block behaviour (List/Header ) dont't stop space/enter event propagation
    RichTextPlugin,
    HeadingsPlugin,
    ListsPlugin,
    TaskListPlugin,
  ],
  oneLine: [
    OneLinePlugin,
  ]
}

const buildSchema = (pluginObjects) => {
  const schema = { document: {}, blocks: {}, inlines: {} }
  _.each(pluginObjects, (o) => { if (o.addToSchema) o.addToSchema(schema) })
  return schema
}

export default function AggregatePlugin(options = {}) {
  const pluginGroup = options.oneLine ? 'oneLine' : 'rich'
  const pluginObjects = pluginConstructors[pluginGroup].map((pluginConstructor) => {
    return pluginConstructor(options);
  })
  return {
    plugins:             _.compact(_.flatMap(pluginObjects, o => o.plugins)),
    htmlSerializerRules: _.compact(_.flatMap(pluginObjects, o => o.htmlSerializerRules)),
    schema:              buildSchema(pluginObjects),
  }
}
