import Ember from 'ember'

const {
  copy,
  A: EmberArray,
  set,
  get,
} = Ember;

const graphQLMetaFields = EmberArray([
  '__schema',
  '__typename'
])

const addGraphQLFieldsToClone = (object, clone) => {
  for (let property in object) {
    if (graphQLMetaFields.includes(property)) {
      set(clone, property, get(object, property));
    }
  }
}


export default object => {
  const clonedObject = copy(object);
  addGraphQLFieldsToClone(object, clonedObject);
  return clonedObject;
}
