const { PrismaClient } = require('@prisma/client')
const FrontendAction = require('./front-end-action');
const { Selector, catalogName } = require('./constant')
const { getIssueBaseInfo, getIssueDescription, getIssueAnswer, getSaveIssueParams, filterUpdateIssueList } = require('./helper')

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

      const savedQuestionList = await prisma.$queryRaw`SELECT a.id, a.title, a.sort, b.content AS answer, b.link, c.label
      FROM 
      t_question AS a, 
      t_answer AS b, 
      (SELECT question_id, GROUP_CONCAT(label SEPARATOR ',') as label
      FROM t_question_label 
      WHERE catalog_id = ${catalogId}
      GROUP BY question_id) AS c
      WHERE a.id = b.question_id AND a.id = c.question_id AND b.question_id = c.question_id
      AND a.catalog_id = b.catalog_id
      AND a.catalog_id = ${catalogId}
      AND b.valid = 1;`

      // get addQuestionList、 updateAnswerList、 addLabelList、 removeLabelList
      const { addQuestionList, updateAnswerList, addLabelList, removeLabelList } = filterUpdateIssueList(savedQuestionList, issueList);

      // add new question
      addQuestionList.length && await this.saveQuestion(addQuestionList, catalogId, prisma);

      // update answer

    }catch(e) {
      console.error(e);
    }finally {
      prisma.$disconnect();
    }
  }

  /**
   * update answer
   * @param {*} updateAnswerList 
   * @param {*} prisma 
   */
  async saveQuestion (addQuestionList, catalogId, prisma) {
    if(!addQuestionList || !addQuestionList.length || !catalogId || prisma) return

    try {
       // save question
       const questionParams = addQuestionList.map(item => {
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
  
      // TODO: just select new add question
      const savedQuestionList = await prisma.question.findMany({
        where: { catalog_id: catalogId },
        select: { id: true, title: true }
      });
  
     const { labelList, answerList } = getSaveIssueParams(savedQuestionList, addQuestionList);
  
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
    }catch(e) {
      console.error(e);
    }
  }

  /**
   * update answer
   * @param {*} updateAnswerList 
   * @param {*} prisma 
   */
   async updateAnswer (updateAnswerList, prisma) {
    if(!updateAnswerList || !updateAnswerList.length || prisma) return
    const updateAnswerParams = updateAnswerList.map(item => {
      const { id, answer, link } = item;
      return {
        data: {
          content: answer,
          link
        },
        where: {
          id
        }
      }
    })
    await prisma.answer.updateMany({
      data: updateAnswerParams
    })
  }

  /**
   * add question label
   */
  async addQuestionLabel (addLabelList, prisma) {
    if(!addLabelList || !addLabelList.length || !prisma) return

    const addLabelParams = addLabelList.map(item => {
      const { questionId, label } = item;
      return {
        questionId,
        label
      }
    })

    await prisma.questionLabel.createMany({
      data: addLabelParams
    })
  }

  /**
   * delete question label
   */
  async deleteQuestionLabel (removeLabelList, prisma) {
    if(!removeLabelList || !removeLabelList.length || !prisma) return

    const removeLabelParams = removeLabelList.map(item => {
      const { questionId, label } = item;
      return {
        questionId,
        label
      }
    })

    await prisma.questionLabel.deleteMany({
      where: {
        OR: removeLabelParams
      }
    })
  }

  /**
   * get issue info list from database
   */
  async getIssueInfoListFromDB() {
    const prisma = new PrismaClient()

    const res = await prisma.$queryRaw`SELECT a.id, a.title, a.sort, b.content AS answer, b.link, c.label
    FROM 
    t_question AS a, 
    t_answer AS b, 
    (SELECT question_id, GROUP_CONCAT(label SEPARATOR ',') as label
    FROM t_question_label 
    WHERE catalog_id = 1
    GROUP BY question_id) AS c
    WHERE a.id = b.question_id AND a.id = c.question_id AND b.question_id = c.question_id
    AND a.catalog_id = b.catalog_id
    AND a.catalog_id = 1
    AND b.valid = 1;`

    prisma.$disconnect();

    return res
   
  }
}

module.exports = Frontend;