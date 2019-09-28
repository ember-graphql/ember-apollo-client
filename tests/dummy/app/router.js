import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('characters');
  this.route('luke');
  this.route('anakin');
  this.route('new-review');
});

export default Router;
