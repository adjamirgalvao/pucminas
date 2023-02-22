const express = require('express');
const cors = require('cors');
const path = require('path');
const json2xls = require('json2xls');
const jsonServer = require('json-server');
const fs = require("fs");
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

//Autentenciacao
const PassportStrategy = require('./auth/Passport');
const passport = require('passport');
//
const bodyParser = require('body-parser');

const app = express();

//Cors
app.use(cors());
//Conversão de json para xlsx
app.use(json2xls.middleware);
// Apply strategy to passport
PassportStrategy.applyPassportStrategy(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/produtos", require('./routers/produtoRouter'));
app.use("/api/fornecedores", require('./routers/fornecedorRouter'));
app.use("/api/compras", require('./routers/compraRouter'));
app.use("/api/clientes", require('./routers/clienteRouter'));
app.use("/api/vendedores", require('./routers/vendedorRouter'));
app.use("/api/vendas", require('./routers/vendaRouter'));
app.use("/api/usuarios", require('./routers/usuarioRouter'));
app.use("/api/autenticacao", require('./routers/autenticacaoRouter'));

//Levantando o mock
//https://www.npmjs.com/package/json-server
//https://github.com/typicode/json-server/issues/253
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const idFieldName = '_id';
// Middleware para modificar o nome do campo ID
router.render = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({});
  } else {
    if (Array.isArray(res.locals.data)) {
      res.jsonp(
        res.locals.data.map(item => {
          const { id, ...dataWithoutId } = item;
          return { [idFieldName]: id, ...dataWithoutId, };
        })
      );
    } else {
      const { id, ...dataWithoutId } = res.locals.data;
      res.jsonp({ [idFieldName]: id, ...dataWithoutId, });
    }
  }
};

// Mock de arquivos  
function retornarArquivo(req, res, arquivo, tipo) {
  if (!req.headers.authorization) {
    return res.status(401).json({});
  } else {
    fs.readFile(path.join(__dirname, 'arquivos_mock', arquivo), (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erro ao ler o arquivo.');
        return;
      }
      //https://github.com/swagger-api/swagger-ui/issues/5750
      //https://stackoverflow.com/questions/30470276/node-express-content-disposition
      res.set({
        'Content-Disposition': 'attachment; filename=' + arquivo,
        'Content-Type': tipo,
        'Cache-Control': "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expries": "0",
      });
      res.status(200).send(data);
    });
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

let funcionalidades = ["fornecedores", "clientes", "vendedores", "produtos", "compras", "clientes"];
for (let i in funcionalidades){
  app.use(`/mock/api/${funcionalidades[i]}/relatorios/listagem`, (req, res) => { retornarArquivo(req, res, `${capitalizeFirstLetter(funcionalidades[i])}.pdf`, "application/pdf") });
  app.use(`/mock/api/${funcionalidades[i]}/exportar/listagem`, (req, res) => { retornarArquivo(req, res, `${capitalizeFirstLetter(funcionalidades[i])}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") });
}
app.use('/mock/api', router);

//Levantando o swagger
const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, '../documentacao', 'api.yaml'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Levantando o angular
app.use(express.static(path.join(__dirname, '../frontend/dist', 'loja')));
app.get('/*', function (req, res) { res.sendFile(path.join(__dirname, '../frontend/dist', 'loja', 'index.html')) });

module.exports = app;