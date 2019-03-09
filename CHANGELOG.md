# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking

- `graphql` has been added as a peer dependency and removed from the addon's direct dependency. Please run `ember install ember-apollo-client` to add the default dependencies to your project or run `yarn add -D graphql`.
- If you are using Ember versions 3.4 or 3.5 you must add `ember-native-class-polyfil` to your application. Please run `ember install ember-native-class-polyfil`. Later Ember versions are not required to have this polyfil.
- Dropped support for Ember LTS 2.18. We now only support the last LTS version (3.4) and above.


## [v2.0.0-beta.3] - 2019-03-09

### Added

- Add built-in support for GraphQL subscriptions. Thanks [@coladarci](https://github.com/coladarci)! ([#173](https://github.com/bgentry/ember-apollo-client/pull/173))

## [v2.0.0-beta.2] - 2019-02-19

### Changed

- Add configuration options to keep graphql file extension. Thanks [@josemarluedke](https://github.com/josemarluedke)! ([#230](https://github.com/bgentry/ember-apollo-client/pull/230))

## [v2.0.0-beta.1] - 2018-09-18

### Changed

- Switch from custom webpack build setup to ember-auto-import. Thanks [@jasonmit](https://github.com/jasonmit)! ([#159](https://github.com/bgentry/ember-apollo-client/pull/159))
- The old build configs (`include`, `exclude`) have been removed. Additional dependencies can be used via ember-auto-import and a regular npm install.
- The old, deprecated mixin import paths have been removed.
- The deprecated `middlewares` option has been removed from the apollo service. Users should switch to override `link` instead.

## [v1.1.0] - 2018-09-14

### Changed

- Addon config is now fetched lazily thanks to [@lennyburdette](https://github.com/lennyburdette) in [#166](https://github.com/bgentry/ember-apollo-client/pull/166).
- The old mixin import paths have been deprecated ([#167](https://github.com/bgentry/ember-apollo-client/pull/167)). Thanks [@jasonmit](https://github.com/jasonmit)!
