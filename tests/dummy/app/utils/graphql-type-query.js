export default {
  __schema: {
    types: [
      {
        kind: 'UNION',
        name: 'SearchResult',
        possibleTypes: [
          {
            name: 'Droid',
          },
          {
            name: 'Human',
          },
          {
            name: 'Starship',
          },
        ],
      },
      {
        kind: 'OBJECT',
        name: 'Droid',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: 'Human',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: 'Starship',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: '__Schema',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: '__Type',
        possibleTypes: [],
      },
      {
        kind: 'ENUM',
        name: '__TypeKind',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: '__Field',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: '__InputValue',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: '__EnumValue',
        possibleTypes: [],
      },
      {
        kind: 'OBJECT',
        name: '__Directive',
        possibleTypes: [],
      },
      {
        kind: 'ENUM',
        name: '__DirectiveLocation',
        possibleTypes: [],
      },
    ],
  },
};
