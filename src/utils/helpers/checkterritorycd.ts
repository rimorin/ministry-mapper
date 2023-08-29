const isValidTerritoryCode = (territoryCd: string) => {
  // check if code is not alphanumeric, space, or dash
  if (!/^[a-zA-Z0-9- ]*$/.test(territoryCd)) {
    return false;
  }
  // check if code is not empty
  if (territoryCd === "") {
    return false;
  }
  return true;
};

export default isValidTerritoryCode;
