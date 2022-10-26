const { PrismaClient } = require('@prisma/client')
const FrontendAction = require('./front-end-action');
const { Selector, catalogName } = require('./constant')
const { getIssueBaseInfo, getIssueDescription, getIssueAnswer, getSaveIssueParams } = require('./helper')

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

  /**
   * save issue info list to database
   */
  async saveIssueInfoList(issueList) {
    if(!issueList || !issueList.length) return

    const prisma = new PrismaClient()

    try {
      const { id: catalogId } = await prisma.catalog.findFirst({
        where: { name: catalogName },
        select: { id: true }
      });
  
      // save question
      const questionParams = issueList.map(item => {
        const { title, description, index } = item;
        return {
          title,
          description,
          sort: index,
          catalog_id: catalogId,
          create_person: 1,
          create_time: new Date()
        }
      })
      await prisma.question.createMany({ data: questionParams })
  
      const questionList = await prisma.question.findMany({
        where: { catalog_id: catalogId },
        select: { id: true, title: true }
      });
  
     const { labelList, answerList } = getSaveIssueParams(questionList, issueList);
  
     // save answer
      const answerParams = answerList.map(item => {
        const { questionId, answer, link } = item;
        return {
          question_id: questionId,
          content: answer,
          type: 1, // 1 html, 2 string
          link,
          create_time: new Date()
        }
      })
      await prisma.answer.createMany({ data: answerParams })
  
      // save label
      const labelParams = labelList.map(item => {
        const { questionId, label } = item;
        return {
          question_id: questionId,
          label,
          create_time: new Date()
        }
      })
      await prisma.questionLabel.createMany({ data: labelParams })
      await prisma.$disconnect()
    }catch(e) {
      console.error(e);
    }finally {
      prisma.$disconnect();
    }
  }

  /**
   * get issue info list from database
   */
  async getIssueInfoListFromDB() {
    const prisma = new PrismaClient()

    async function main() {
      const data = await prisma.t_question.findMany()
      console.log('main-->', data)
      return data
    }

    main()
    .then(async (data) => {
      console.log('then-->', data)
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })
   
  }
}

module.exports = Frontend;