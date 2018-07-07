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
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: 'Human',
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: 'Starship',
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: '__Schema',
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: '__Type',
        possibleTypes: null,
      },
      {
        kind: 'ENUM',
        name: '__TypeKind',
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: '__Field',
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: '__InputValue',
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: '__EnumValue',
        possibleTypes: null,
      },
      {
        kind: 'OBJECT',
        name: '__Directive',
        possibleTypes: null,
      },
      {
        kind: 'ENUM',
        name: '__DirectiveLocation',
        possibleTypes: null,
      },
    ],
  },
};
