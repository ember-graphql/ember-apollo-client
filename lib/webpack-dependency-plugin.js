'use strict';

const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const Plugin = require('broccoli-plugin');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

/*
 * Given a list of modules and a name for the output, bundles together those modules
 * and all their dependencies, providing an AMD definition for each exposed module that
 * the Ember app's loader.js instance will pick up.
 */
module.exports = class WebpackDependencyPlugin extends Plugin {
  constructor(options) {
    super([], {
      annotation: options.outputName,
      persistentOutput: true,
      needsCache: false
    });

    this.options = options;
  }

  build() {
    let outputFile = path.join(this.outputPath, `-${this.options.outputName}-bundle.js`);
    if (fs.existsSync(outputFile)) return;

    this._writeEntryFile();
    this._writeShims();

    return this._bundleLibraries();
  }

  _entryPath() {
    return path.join(this.outputPath, `-${this.options.outputName}-entry.js`);
  }

  _shimsPath() {
    return path.join(this.outputPath, `-${this.options.outputName}-shims.js`);
  }

  _writeEntryFile() {
    // Write a single file that reexports all modules we're interested in exposing, so we
    // can use it as the entry point for Webpack.
    let libs = this.options.expose.map(lib => `'${lib}': require('${lib}')`);
    let contents = `module.exports = { ${libs.join(', ')} };`;

    fs.writeFileSync(this._entryPath(), contents, 'utf-8');
  }

  _writeShims() {
    // Write a shims file that defines a module for each item we reexported in our entry.
    // By adding our built bundle and this file to the build, we expose the requested modules
    // to the including app's AMD module system.
    let defines = this.options.expose.map(lib => `
      define('${lib}', ['-${this.options.outputName}-bundle'], function(bundle) {
        return bundle['${lib}'];
      });
    `);

    fs.writeFileSync(this._shimsPath(), defines.join(''), 'utf-8');
  }

  _bundleLibraries() {
    return new Promise((resolve, reject) => {
      webpack({
        entry: this._entryPath(),
        plugins: [
          new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(EmberApp.env()) })
        ],
        output: {
          library: `-${this.options.outputName}-bundle`,
          libraryTarget: 'amd',
          path: this.outputPath,
          filename: `-${this.options.outputName}-bundle.js`
        }
      }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
};
