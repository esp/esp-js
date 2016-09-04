let id = 0;
const idFactory = (tag) => `${tag}-${id++}`;
export default idFactory;