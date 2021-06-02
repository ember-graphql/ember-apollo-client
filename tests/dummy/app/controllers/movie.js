import Controller from '@ember/controller';

export default class MovieController extends Controller {
  get reviews() {
    return this.model.movie.reviews.edges.map((edge) => {
      return edge.node;
    });
  }
}
