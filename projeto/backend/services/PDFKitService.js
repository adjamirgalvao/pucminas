const PDFTable = require('pdfkit-table');
const blobStream = require('blob-stream');

module.exports = class PDFKitService {

  //https://github.com/natancabral/pdfkit-table/blob/main/example/index-server-example.js
  static gerarPDF = async (res, title, headers, dados) => {

    const doc = new PDFTable({bottomMargin: 30});
    const stream = doc.pipe(blobStream());
    doc.font('Helvetica-Bold').fontSize(14).text(title, {align: 'left', underline: true, lineGap: 10});


    ;(async function createTable(){
      // table
      const table = { 
        headers: headers,
        datas: dados,
      };

      // the magic (async/await)
      await doc.table(table, { /* options */ });
      // Configura a resposta para renderizar o documento PDF
      res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=tabela.pdf'
      });
      doc.pipe(res);
  
      // done!
      doc.end();
    })();
  };


}
