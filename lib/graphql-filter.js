'use strict';

const Filter = require('broccoli-filter');
const gql = require('graphql-tag');

module.exports = class GraphQLFilter extends Filter {
  constructor(inputNode, options) {
    super(inputNode, options);
    this.extensions = ['graphql'];
    this.targetExtension = 'js';
  }

  processString(source) {
    let output = [
      `const doc = ${JSON.stringify(gql([source]), null, 2)};`,
      `export default doc;`
    ];

    source.split('\n').forEach((line, i) => {
      let match = /^#import\s+(.*)/.exec(line);
      if (match && match[1]) {
        output.push(`import dep${i} from ${match[1]};`);
        output.push(`doc.definitions = doc.definitions.concat(dep${i}.definitions);`);
      }
    });

    return output.join('\n');
  }
}
