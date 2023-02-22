const express = require('express');
const cors = require('cors');
const path = require('path');
const json2xls = require('json2xls');
const { JsonServer, RouterExtra } = require("./routers/mockRouter");
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

// Levantando a API da aplicação
app.use("/api/autenticacao", require('./routers/autenticacaoRouter'));
app.use("/api/usuarios", require('./routers/usuarioRouter'));
app.use("/api/fornecedores", require('./routers/fornecedorRouter'));
app.use("/api/produtos", require('./routers/produtoRouter'));
app.use("/api/vendedores", require('./routers/vendedorRouter'));
app.use("/api/clientes", require('./routers/clienteRouter'));
app.use("/api/compras", require('./routers/compraRouter'));
app.use("/api/vendas", require('./routers/vendaRouter'));

//Levantando o mock
app.use("/mock/api", RouterExtra);
app.use("/mock/api", JsonServer);

//Levantando o swagger
const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, '../documentacao', 'api.yaml'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Levantando o angular
app.use(express.static(path.join(__dirname, '../frontend/dist', 'loja')));
app.get('/*', function (req, res) { res.sendFile(path.join(__dirname, '../frontend/dist', 'loja', 'index.html')) });

module.exports = app;