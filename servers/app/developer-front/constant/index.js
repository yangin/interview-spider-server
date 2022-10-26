const Website = require('./website');
const Selector = require('./selector');

const catalogName = 'frontend';  // 存储数据库时的分类名称

module.exports = {
  Selector,
  ...Website,
  catalogName
}