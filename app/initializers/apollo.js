import config from '../config/environment';

/* eslint-disable no-unused-vars */
import graphql from 'npm:graphql';
/* eslint-disable no-unused-vars */
import graphqlTools from 'npm:graphql-tools';

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
