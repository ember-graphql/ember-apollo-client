import { computed } from "@ember/object";

export default function middlewares(...middlewares) {
  return computed(function() {
    return middlewares.map((middleware) => {
      return { applyMiddleware: this.get(middleware).bind(this) };
    });
  });
}
