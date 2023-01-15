const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(session({secret: 'teste'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use("/", require('./routers/routers'));
app.use("/produtos", require('./routers/produtoRouter'));
app.use("/itensCompras", require('./routers/itemCompraRouter'));
app.use("/compras", require('./routers/compraRouter'));

module.exports = app;
