import Component from '@ember/component';
import layout from '../templates/components/character-item';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  decoratedName: computed('character.name', function() {
    return this.character.name.toUpperCase() + '_computed';
  }),
});
