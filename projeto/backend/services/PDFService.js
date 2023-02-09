const puppeteer = require("puppeteer");

module.exports = class PDFService {

  static gerarPDF = async (html) => {
    const browser = await puppeteer.launch();
    const tab = await browser.newPage();
    await tab.setContent(html);
    const pdf = await tab.pdf({ format: 'A4' });
    await browser.close();

    return pdf;
  };
}
