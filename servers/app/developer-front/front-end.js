const FrontendAction = require('./front-end-action');
const { Selector } = require('./constant')
const { getIssueBaseInfo, getIssueDescription, getIssueAnswer } = require('./helper')

class Frontend extends FrontendAction {
  /**
   * get issue list
   * @returns {Promise}
   */
  async getIssueInfoList() {
    let issueList = [];
    let hasNextPage = true;

    while(hasNextPage) {
      const currentIssueList = await this.getCurrentPageIssueInfoList();
      issueList.push(...currentIssueList);
      hasNextPage = await this.goToNextPage();
    }

    return issueList
  }

  /**
   * get current page data
   * @returns {Promise}
   */
  async getCurrentPageIssueInfoList() {
    const { page } = this;
    const issueList = await page.$$(Selector.issueItem);
    const allList = await Promise.all(issueList.map(issueEl => getIssueBaseInfo(issueEl)));
    const validList = allList.filter(item => item);
    // 获取题目和序号
    const issueInfoList = []
    for(let i=0; i<validList.length; i++) {
      const item = validList[i];
      const { description, answer } = await this.getIssueComment(item);
      const info = {
        ...item,
        description,
        answer
      }
      issueInfoList.push(info);
    }
    return issueInfoList
  }

  /**
   * get issue comment, include description and answer
   */
  async getIssueComment(issue) {
    const { link } = issue;
    const page = await this.initSubWebsite(link);
    const description = await getIssueDescription(page);
    const answer = await getIssueAnswer(page);
    page.close();
    return {
      description,
      answer
    }
  }
}

module.exports = Frontend;