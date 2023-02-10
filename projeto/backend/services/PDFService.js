const puppeteer = require("puppeteer");

module.exports = class PDFService {

  //https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/
  //https://stackoverflow.com/questions/53170541/generate-pdf-with-puppeteer-without-save-it
  //https://rominirani.com/using-puppeteer-in-google-cloud-functions-809a14856e14
  static gerarPDF = async (html) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const tab = await browser.newPage();
    await tab.setContent(html);
    const pdf = await tab.pdf({ format: 'A4' });
    await browser.close();

    return pdf;
  };


}
