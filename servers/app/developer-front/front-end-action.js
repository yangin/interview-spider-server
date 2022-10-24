const Spider = require('../../utils/spider');
const { Selector } = require('./constant')

class FrontendAction extends Spider {

  async goToNextPage() {
    const hasNext= await this.page.$(Selector.nextPage)
    if(!hasNext) return false
    await this.page.click(Selector.nextPage);
    await this.page.waitForSelector(Selector.issueItem);
    await this.page.waitForTimeout(1000);  // 等待1秒，等待页面加载完成
    return true
  }
}

module.exports = FrontendAction;