import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () {
  this.route('new-review');
  this.route('movie', { path: '/movie/:id' });
});

export default Router;
