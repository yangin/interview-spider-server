/**
 * querySelector
 * if element is not found, it will return null, not throw error
 * @param {*} element 
 * @param {*} selector 
 * @param {*} callback 
 * @returns 
 */
const select = async (element, selector, callback) => {
  const el = await element.$(selector);
  if (el) {
    return element.$eval(selector, callback)
  }
  return null;
}

/**
 * querySelectorAll
 * if element is not found, it will return null, not throw error
 * @param {*} element 
 * @param {*} selector 
 * @param {*} callback 
 * @returns 
 */
 const selectAll = async (element, selector, callback) => {
  const el = await element.$$(selector);
  if(!el.length) return [];

  const result = await element.$$eval(selector, callback);
  return result;
}

module.exports = {
  select,
  selectAll
}