export default function getSuperComputed<C extends object>(
  instance: C,
  key: keyof C
) {
  const desc = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(Object.getPrototypeOf(instance)),
    key
  )!;

  if (desc) {
    if (desc.get || desc.set) {
      return { get: desc.get, set: desc.set };
    } else if (desc.value && (desc.value._getter || desc.value._setter)) {
      return { get: desc.value._getter, set: desc.value._setter };
    }
  }

  throw new TypeError(
    `Could not retrieve super computed property '${key}' from '${instance}'.`
  );
}
