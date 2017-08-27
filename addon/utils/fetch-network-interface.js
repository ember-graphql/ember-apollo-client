import ApolloClient from 'npm:apollo-client';
import fetch from 'fetch';
import Ember from 'ember';

const { 
  RSVP: {
    Promise
  },
  assign
} = Ember;

const {
  HTTPFetchNetworkInterface,
  printAST
} = ApolloClient;

export default class FetchNetworkInterface extends HTTPFetchNetworkInterface {
  fetchFromRemoteEndpoint({ request, options }) {
    var variables = request.variables;
    var query = printAST(request.query);

    return Promise( (resolve, reject) => {
      return fetch(this._uri, assign(
        this._opts,
        assign({method: 'POST',
          body: JSON.stringify({variables, query})},
          options,
          { headers: assign({
            Accept: '*/*',
            'Content-Type': 'application/json'},
            options.headers
          )
        })
      )).then((response) =>{
        resolve(response);
      }).catch((response) =>{
        reject(response);
      })
    });
  }
} 