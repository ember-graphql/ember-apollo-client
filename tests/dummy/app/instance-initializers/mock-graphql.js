import Pretender from 'pretender';
import { graphql } from 'graphql';
import {
  addMockFunctionsToSchema,
  addResolveFunctionsToSchema,
  makeExecutableSchema,
} from 'graphql-tools';
import schemaString from '../schema';
import config from 'dummy/config/environment';

const __resolveType = ({ type }) => type;

// https://developers.themoviedb.org/3/movies/get-top-rated-movies
let movies = [
  {
    id: 238,
    title: 'The Godfather',
    voteAverage: 8.6,
    posterPath: '/rPdtLWNsZmAtoZl9PK7S2wE3qiS.jpg',
    overview:
      'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
    releaseDate: '1972-03-15',
  },

  {
    id: 680,
    title: 'Pulp Fiction',
    voteAverage: 8.4,
    posterPath: '/dM2w364MScsjFf8pfMbaWUcWrR.jpg',
    overview:
      "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
    releaseDate: '1994-10-14',
  },

  {
    id: 240,
    title: 'The Godfather: Part II',
    voteAverage: 8.5,
    posterPath: '/bVq65huQ8vHDd1a4Z37QtuyEvpA.jpg',
    overview:
      'In the continuing saga of the Corleone crime family, a young Vito Corleone grows up in Sicily and in 1910s New York. In the 1950s, Michael Corleone attempts to expand the family business into Las Vegas, Hollywood and Cuba.',
    releaseDate: '1974-12-20',
  },

  {
    id: 13,
    title: 'Forrest Gump',
    voteAverage: 8.4,
    posterPath: '/yE5d3BUhE8hCnkMUJOo1QDoOGNz.jpg',
    overview:
      'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.',
    releaseDate: '1994-07-06',
  },
];

function startPretender() {
  let resolvers = {
    // This is where you would declare custom resolvers. For example, assume we
    // had a custom ID type:
    //
    // IDType: {
    //   __parseValue(value) {
    //     return value;
    //   },
    //   __serialize(value) {
    //     return value;
    //   },
    //   __parseLiteral(ast) {
    //     return ast.value;
    //   }
    // },

    // We set up __resolveType for this interface type here, then it is inherited
    // when we build the schema:
    SearchResult: { __resolveType },
    Query: {
      movies(_, args) {
        if (args.topRated) {
          return movies.filter((movie) => {
            if (movie.voteAverage >= 8.5) {
              return movie;
            }
            return false;
          });
        }
        return movies;
      },
      movie(_, args) {
        return movies.find((movie) => {
          return movie.id == args.id;
        });
      },
    },
    Mutation: {
      changeMovieTitle(_, { id, title }) {
        let movie = movies.find((movie) => {
          return movie.id == id;
        });
        return Object.assign(movie, { title });
      },
    },
  };
  let typeResolvers = {
    // This is where you can declare custom type resolvers, such as those
    // necessary to infer the specific object type of a union type.
  };
  let mocks = {
    // This is where you tell graphql-tools how to generate a mock for a custom
    // scalar type:
    //
    // Time() {
    //   return moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    // }

    Date() {
      return '2019-09-28';
    },
  };

  let schema = makeExecutableSchema({ typeDefs: schemaString, resolvers });
  addResolveFunctionsToSchema({
    schema,
    resolvers: typeResolvers,
    inheritResolversFromInterfaces: true,
  });
  addMockFunctionsToSchema({ schema, mocks, preserveResolvers: true });

  let pretender = new Pretender();

  pretender.post('https://test.example/graphql', function (request) {
    let body = JSON.parse(request.requestBody);

    return graphql(schema, body.query, {}, {}, body.variables).then(
      (result) => {
        return [200, { 'Content-Type': 'application/json' }, result];
      }
    );
  });

  pretender.prepareBody = function (body) {
    return JSON.stringify(body);
  };

  pretender.handledRequest = function (verb, path, request) {
    console.group('Mocked Request');
    console.info(verb, path);
    try {
      console.info('Request', JSON.parse(request.requestBody));
      console.info('Response', JSON.parse(request.responseText));
    } catch (e) {
      console.info('Request', request.requestBody);
      console.info('Response', request.responseText);
    }
    console.groupEnd();
  };
  return pretender;
}

export function initialize(/* appInstance */) {
  if (config.environment !== 'test') {
    startPretender();
  }
}

export default {
  initialize,
};
