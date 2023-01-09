const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(session({secret: 'teste'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use("/", require('./routers/routers'));
app.use("/produtos", require('./routers/produtoRouter'));

module.exports = app;
