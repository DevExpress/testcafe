// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

const objectToString = Object.prototype.toString;
const stringIndexOf  = String.prototype.indexOf;

const stringEndsWith = String.prototype.endsWith
                              || function (searchString, position) {
                                  const subjectString = objectToString.call(this);

                                  if (position === void 0 || position > subjectString.length)
                                      position = subjectString.length;

                                  position -= searchString.length;

                                  const lastIndex = stringIndexOf.call(subjectString, searchString, position);

                                  return lastIndex !== -1 && lastIndex === position;
                              };

export default stringEndsWith;
