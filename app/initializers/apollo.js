import config from '../config/environment';

export function initialize() {
  const application = arguments[1] || arguments[0];
  const { apollo: { apiURL } } = config;
  const options = { apiURL };

  application.register('config:apollo', options, { instantiate: false });
  application.inject('service:apollo', 'options', 'config:apollo');
}

export default {
  name: 'apollo',
  initialize
};
