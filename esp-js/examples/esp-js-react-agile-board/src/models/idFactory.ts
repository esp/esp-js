let id = 0;
export const idFactory = (tag) => `${tag}-${id++}`;