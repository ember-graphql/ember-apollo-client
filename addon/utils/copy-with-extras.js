const extraCopyProperties = ['__typename'];

export default function copyWithExtras(obj, seen, copies) {
  let ret, loc, key;

  // primitive data types are immutable, just return them.
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // avoid cyclical loops
  if ((loc = seen.indexOf(obj)) >= 0) {
    return copies[loc];
  }

  if (Array.isArray(obj)) {
    ret = obj.slice();

    loc = ret.length;

    while (--loc >= 0) {
      ret[loc] = copyWithExtras(ret[loc], seen, copies);
    }
  } else if (obj instanceof Date) {
    ret = new Date(obj.getTime());
  } else {
    ret = {};

    for (key in obj) {
      // support Null prototype
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }

      // Prevents browsers that don't respect non-enumerability from
      // copying internal Ember properties
      if (key.substring(0, 2) === '__') {
        continue;
      }

      ret[key] = copyWithExtras(obj[key], seen, copies);
    }
    extraCopyProperties.forEach(
      propertyName => (ret[propertyName] = obj[propertyName])
    );
  }

  seen.push(obj);
  copies.push(ret);

  return ret;
}
