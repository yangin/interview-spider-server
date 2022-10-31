/**
 * is equal between two arrays of string
 */
function isEqualArray(arr1, arr2) {
  if(arr1.length !== arr2.length) {
    return false
  }
  return arr1.every(item => arr2.includes(item))
}

module.exports = {
  isEqualArray
}