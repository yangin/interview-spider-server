const Frontend = require('./front-end');
const { Selector, website } = require('./constant')

module.exports = {
  /**
   * spider data from exact website
   */
  async spiderData() {
    const frontend = new Frontend();
    await frontend.initWebsite(website)
    // const data = await frontend.getIssueInfoList();
    const data = await frontend.getCurrentPageIssueInfoList();
    // const data = await frontend.getIssueInfoListFromDB();
    const res = await frontend.saveIssueInfoList(data)
    // const res = await frontend.saveIssueInfoList()
    console.log('success-->', res);
  }
}