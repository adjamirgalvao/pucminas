const express = require('express');
const cors = require('cors');

//Autentenciacao
const PassportStrategy = require('./auth/Passport');
const passport = require('passport');
//
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
// Apply strategy to passport
PassportStrategy.applyPassportStrategy(passport);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use("/", require('./routers/routers'));
app.use("/api/produtos", require('./routers/produtoRouter'));
app.use("/api/fornecedores", require('./routers/fornecedorRouter'));
app.use("/api/itensCompras", require('./routers/itemCompraRouter'));
app.use("/api/compras", require('./routers/compraRouter'));
app.use("/api/clientes", require('./routers/clienteRouter'));
app.use("/api/vendedores", require('./routers/vendedorRouter'));
app.use("/api/itensVendas", require('./routers/itemVendaRouter'));
app.use("/api/vendas", require('./routers/vendaRouter'));
app.use("/api/usuarios", require('./routers/usuarioRouter'));

module.exports = app;
