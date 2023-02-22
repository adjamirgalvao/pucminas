const path = require('path');
const fs = require("fs");
const jsonServer = require('json-server');
const express = require("express");
const router = express.Router();

//https://www.npmjs.com/package/json-server
//https://github.com/typicode/json-server/issues/253
const routerJsonServer = jsonServer.router(path.join(__dirname, '../db.json'));

const idFieldName = '_id';
// Middleware para modificar o nome do campo ID
routerJsonServer.render = (req, res) => {
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
    fs.readFile(path.join(__dirname, '../arquivos_mock', arquivo), (err, data) => {
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
  router.get(`/${funcionalidades[i]}/relatorios/listagem`, (req, res) => { retornarArquivo(req, res, `${capitalizeFirstLetter(funcionalidades[i])}.pdf`, "application/pdf") });
  router.get(`/${funcionalidades[i]}/exportar/listagem`, (req, res) => { retornarArquivo(req, res, `${capitalizeFirstLetter(funcionalidades[i])}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") });
}


module.exports = {
    JsonServer: routerJsonServer,
    RouterArquivos: router,
  };
  /*
  module.exports = routerJsonServer;*/