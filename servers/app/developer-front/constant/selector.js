const Selector = {
  issueItem: 'div[id^="issue_"]',
  issue: {
    title: 'div>a[id^="issue_"][id$="_link"]', // innerText
    label: 'a[id^="label-"]', // data-name
    link: 'a.Link--muted[aria-label*="comment"]', // href
    commentCount: 'a.Link--muted[aria-label*="comment"]>span', // innerText
  },
  author: '#partial-discussion-header>div>div>a.author', // innerText
  description: '.TimelineItem>.TimelineItem-body[id^="issue-"]>div>div.edit-comment-hide>task-lists', // innerHTML
  emptyDescription: 'table>tbody:first-child>tr:first-child>td:first-child>p:first-child>em', // innerHTML
  commentItem: '.TimelineItem>[id^="issuecomment-"]',
  comment: {
    content: '.edit-comment-hide>task-lists', // innerHTML
    upCount: '.edit-comment-hide>div form>div.js-comment-reactions-options>button[aria-label="react with thumbs up"]>span.js-discussion-reaction-group-count', // innerText
    hoorayCount: '.edit-comment-hide>div form>div.js-comment-reactions-options>button[aria-label="react with hooray"]>span.js-discussion-reaction-group-count', // innerText
    heartCount: '.edit-comment-hide>div form>div.js-comment-reactions-options>button[aria-label="react with heart"]>span.js-discussion-reaction-group-count', // innerText
    smileCount: '.edit-comment-hide>div form>div.js-comment-reactions-options>button[aria-label="react with laugh"]>span.js-discussion-reaction-group-count', // innerText
    rocketCount: '.edit-comment-hide>div form>div.js-comment-reactions-options>button[aria-label="react with rocket"]>span.js-discussion-reaction-group-count', // innerText
    eyesCount: '.edit-comment-hide>div form>div.js-comment-reactions-options>button[aria-label="react with eyes"]>span.js-discussion-reaction-group-count', // innerText
  },
  nextPage: 'a[rel="next"].next_page', // href
}

module.exports = Selector