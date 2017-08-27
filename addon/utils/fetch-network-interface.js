import ApolloClient from 'npm:apollo-client';
import fetch from 'fetch';

const {
  HTTPFetchNetworkInterface,
  printAST
} = ApolloClient;

export default class FetchNetworkInterface extends HTTPFetchNetworkInterface {
  fetchFromRemoteEndpoint({ request, options }) {
    var variables = request.variables;
    var query = printAST(request.query);

    return new Promise( (resolve, reject) => {
      return fetch(this._uri, {
        ...this._opts,
        method: 'POST',
        body: JSON.stringify({variables, query}),
        ...options,
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          ...options.headers
        }
      }).then((response) =>{
        resolve(response);
      }).catch((response) =>{
        reject(response);
      })
    });
  };
} 