const { Selector } = require('./constant');
const { select, selectAll } = require('../../utils/puppeteer');
const { isEqualArray } = require('../../utils');


/**
 * is valid issue, 
 * issue comment count is not 0, and issue title regexp(/^第\d{1,3}题/) test is true
 * @param {String} title
 * @returns {Boolean}
 */
function isValidIssue(title, commentCount){
  return /^第\d{1,3}题/.test(title.replace(/\s/g, '')) && commentCount > 0;
}

/**
 * get issue base info
 * @param {Object} issue
 * @returns {Object}
 */
async function getIssueBaseInfo(issueEl) {
  const originTitle = await select(issueEl, Selector.issue.title, el => el.innerText);
  const commentCount = await select(issueEl, Selector.issue.commentCount, el => Number(el.innerText)) || 0;

  const isValid = isValidIssue(originTitle, commentCount);
  if(!isValid) return null;

  const title = originTitle.replace(/\s/g, '').replace(/^第\d{1,3}题：/, '');
  const index = Number(originTitle.match(/\d{1,3}/)[0]);
  const label = await selectAll(issueEl, Selector.issue.label, el => el.map(item => item.dataset.name));
  const link = await select(issueEl, Selector.issue.link, el => el.href);

  return {
    title,
    index,
    label,
    link,
    commentCount
  }
}

/**
 * is empty description
 * @param {Element} description 
 * @returns 
 */
async function isEmptyDescription(descriptionEl) {
  const description = await select(descriptionEl, Selector.emptyDescription, el => el.innerText);
  return !!description
}

/**
 * get issue description
 * @param {Object} page
 * @returns {String} 
 */
async function getIssueDescription(page) {
  const descriptionEl = await page.$(Selector.description);

  const isEmpty = await isEmptyDescription(descriptionEl);
  if(isEmpty) return '';

  const description = await select(page, Selector.description, el => el.innerHTML);
  return description
}

/**
 * get issue opener
 * @param {Object} page comment page
 * @returns 
 */
async function getIssueAuthor(page) {
  const author = await select(page, Selector.author, el => el.innerText);
  return author
}

/**
 * get comment content and upCount in comment Element
 * @param {*} commentEl 
 * @returns 
 */
async function getCommentInfo(commentEl) {
  const content = await select(commentEl, Selector.comment.content, el => el.innerHTML);
  const upCount = await select(commentEl, Selector.comment.upCount, el => Number(el.innerText)) || 0;
  const hoorayCount = await select(commentEl, Selector.comment.hoorayCount, el => Number(el.innerText)) || 0;
  const heartCount = await select(commentEl, Selector.comment.heartCount, el => Number(el.innerText)) || 0;
  const smileCount = await select(commentEl, Selector.comment.smileCount, el => Number(el.innerText)) || 0;
  const rocketCount = await select(commentEl, Selector.comment.rocketCount, el => Number(el.innerText)) || 0;
  const eyesCount = await select(commentEl, Selector.comment.eyesCount, el => Number(el.innerText)) || 0;
  const upTotal = upCount + hoorayCount + heartCount + smileCount + rocketCount + eyesCount;
  return {
    content,
    upTotal
  }
}

/**
 * get issue answer
 * get issue comment list, and get the most upCount comment
 * @param {Object} page
 * @returns {String}
 */
async function getIssueAnswer(page) {
  const commentList = await page.$$(Selector.commentItem);
  const allList = await Promise.all(commentList.map(commentEl => getCommentInfo(commentEl)));
  const validList = allList.filter(item => item.upTotal > 0);
  if(!validList.length) return '';
  const commentInfoList = validList.sort((a, b) => b.upTotal - a.upTotal);
  const answer = commentInfoList[0].content;
  return answer
}

/**
 * get issue label params list and answer params list
 * @param {Array<id: number, title: string>} questionList
 * @param {Array<Object>} issueList
 * @returns {Array<Object>}
 */
function getSaveIssueParams(questionList, issueList) {
  const labelList = [];
  const answerList = [];

  issueList.forEach(issue => {
    const { title, label, link, answer } = issue;
    const question = questionList.find(item => item.title === title);
    if(question) {
      const questionId = question.id;
      label.length && label.forEach(item => labelList.push({ questionId, label: item }));
      answerList.push({ questionId, answer, link });
    }
  });

  return {labelList, answerList}
}

/**
 * filter update issue list
 */
function filterUpdateIssueList(questionList, issueList) {
  const addQuestionList = [];
  const updateAnswerList = [];
  const removeLabelList = [];
  const addLabelList = [];
  issueList.forEach(issue => {
    const { title, answer, link } = issue;
    const question = questionList.find(item => item.title === title);
    if(!question) {
      addQuestionList.push(issue)
      return
    }

    if(question.answer !== answer || question.link !== link) {
      updateAnswerList.push({ questionId: question.id, answer, link });
    }

    const savedLabels = question.label.split(',');

    const removeLabels = savedLabels.filter(item => !issue.label.includes(item));
    const addLabels = issue.label.filter(item => !savedLabels.includes(item));
    removeLabelList.push({ questionId: question.id, label: removeLabels });
    addLabelList.push({ questionId: question.id, label: addLabels })
  });
  return {addQuestionList, updateAnswerList, addLabelList, removeLabelList}
}

module.exports = {
  getIssueBaseInfo,
  getIssueDescription,
  getIssueAnswer,
  getIssueAuthor,
  getSaveIssueParams,
  filterUpdateIssueList,
}