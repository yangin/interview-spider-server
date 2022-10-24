const puppeteer = require('puppeteer');

class Spider {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    const browser = await puppeteer.launch({ headless: false });
    this.browser = browser
  }

  async close() {
    await this.browser.close();
  }

  async initWebsite(website) {
    if(!this.browser) await this.init()
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1440, height: 800 })
    await this.page.goto(website);
    await this.page.waitForTimeout(1000);
  }

  async initSubWebsite(website) {
    if(!this.browser) await this.init()
    const page = await this.browser.newPage();
    await page.setViewport({ width: 1440, height: 800 })
    await page.goto(website);
    await page.waitForTimeout(1000);
    return page
  }
}

module.exports = Spider;