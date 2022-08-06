const compareSortObjects = (a: any, b: any) => {
  const a_floor = Number(a.floor);
  const b_floor = Number(b.floor);
  if (a_floor < b_floor) {
    return 1;
  }
  if (a_floor > b_floor) {
    return -1;
  }
  return 0;
};

const HHType = () => (
  <>
    <option value="cn">Chinese</option>
    <option value="tm">Tamil</option>
    <option value="in">Indonesian</option>
    <option value="bm">Burmese</option>
    <option value="ml">Muslim</option>
    <option value="sl">Sign Language</option>
  </>
);

export { compareSortObjects, HHType };
