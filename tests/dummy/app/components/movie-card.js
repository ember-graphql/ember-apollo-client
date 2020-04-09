import Component from '@ember/component';
import layout from '../templates/components/movie-card';
import { computed } from '@ember/object';

export default Component.extend({
  layout,

  formattedReleaseDate: computed('movie.releaseDate', function () {
    if (this.movie.releaseDate) {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
        new Date(this.movie.releaseDate + ' 00:00:00')
      );
    }

    return '';
  }),
});
