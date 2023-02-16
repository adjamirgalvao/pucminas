const express = require('express');
const cors = require('cors');
const path = require('path');
var json2xls = require('json2xls');

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
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));

app.use("/api/produtos", require('./routers/produtoRouter'));
app.use("/api/fornecedores", require('./routers/fornecedorRouter'));
app.use("/api/itensCompras", require('./routers/itemCompraRouter'));
app.use("/api/compras", require('./routers/compraRouter'));
app.use("/api/clientes", require('./routers/clienteRouter'));
app.use("/api/vendedores", require('./routers/vendedorRouter'));
app.use("/api/itensVendas", require('./routers/itemVendaRouter'));
app.use("/api/vendas", require('./routers/vendaRouter'));
app.use("/api/usuarios", require('./routers/usuarioRouter'));
app.use("/api/autenticacao", require('./routers/autenticacaoRouter'));

//Levantando o angular
app.use(express.static(path.join(__dirname, '../frontend/dist', 'loja')));

app.get('/*', function (req, res) {res.sendFile(path.join(__dirname, '../frontend/dist', 'loja', 'index.html'))});
module.exports = app;
