const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require("fs");
const jsonServer = require('json-server');
const axios = require('axios');


function uniqueID() {
    return '' + (Math.floor(Math.random() * Date.now()))
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getFornecedor(req, id) {
    try {
      const host = req.headers.host;
      const protocol = req.protocol;
      const url = `${protocol}://${host}/mock/api/fornecedores/${id}`;
      // senão vai ser interceptado pelo routerJsonServer.render
      const config = {headers: {Authorization: 'Bearer 123'}};    
  
      const response = await axios.get(url, config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
}

//https://www.npmjs.com/package/json-server
//https://github.com/typicode/json-server/issues/253
const routerJsonServer = jsonServer.router(path.join(__dirname, '../mock/db.json'));

const idFieldName = '_id';
// Middleware para modificar o nome do campo ID
routerJsonServer.render = (req, res) => {
   
    if (!req.headers.authorization && !req.path.includes('/autenticacao')) {
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
        fs.readFile(path.join(__dirname, '../mock', arquivo), (err, data) => {
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

//Mock dos arquivos
let funcionalidades = ["fornecedores", "clientes", "vendedores", "produtos", "compras", "clientes"];
for (let i in funcionalidades) {
    router.get(`/${funcionalidades[i]}/relatorios/listagem`, (req, res) => { retornarArquivo(req, res, `${capitalizeFirstLetter(funcionalidades[i])}.pdf`, "application/pdf") });
    router.get(`/${funcionalidades[i]}/exportar/listagem`, (req, res) => { retornarArquivo(req, res, `${capitalizeFirstLetter(funcionalidades[i])}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") });
}

//Mock de funcionalidades não suportadas pelo jsonServer
router.post('/autenticacao/login', (req, res) => {
    if (!req.body.login || !req.body.senha) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
    } else {    
        res.status(200).json({
        usuario: {
            _id: "63dc6c82fd018a07bd7eec36",
            login: req.body.login,
            email: `${req.body.login}@gmail.com`,
            nome: `${capitalizeFirstLetter(req.body.login)} da Silva Santos`,
            roles: [
                "ADMINISTRADOR",
                "GESTOR"
            ]
        },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwiaWF0IjoxNjc3MDgzNzU3LCJleHAiOjE2NzcwOTM3NTd9.QKlf0EEnOo-3TOLjll6m3HPL6sdTiSDvT7EVizqbpuE"});
    }
});

router.post('/autenticacao/registrar', (req, res) => {
    if (!req.body.nome || !req.body.login || !req.body.email || !req.body.senha || !req.body.roles) {
        res.status(400).json({ error: 'Usuário não pode ser criado pois já faltam informações (nome, login, email, senha ou roles).' });
    } else {
        res.status(200).json({
            usuario: {
                _id: "63dc6c82fd018a07bd7eec31",
                login: req.body.login,
                email: req.body.email,
                nome: req.body.nome,
                roles: ["CLIENTE"]
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwiaWF0IjoxNjc3MDgzNzU3LCJleHAiOjE2NzcwOTM3NTd9.QKlf0EEnOo-3TOLjll6m3HPL6sdTiSDvT7EVizqbpuE"});
        }
    }
);

//https://stackabuse.com/reading-and-writing-json-files-with-node-js/
router.get('/compras', (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/compras.json'));
    let compras = JSON.parse(rawdata);
    res.status(200).json(compras);
});

router.post('/compras', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/compras.json'));
    let compras = JSON.parse(rawdata);
    let compra = req.body;

    let total = 0;
    compra._id = uniqueID();  
    if (compra.id_fornecedor) {
        compra.fornecedor = await getFornecedor(req, compra.id_fornecedor);
    }    
    for (let i in compra.itensCompra){
        total += compra.itensCompra[i].preco;
        compra.itensCompra[i].id_compra = compra._id;
        compra.itensCompra[i]._id = uniqueID();
        compra.itensCompra[i].__v = 0;
    }

    compra.total = total;
    compra.__v = 0;
    compras.push(compra);

    fs.writeFileSync(path.join(__dirname, '../mock/compras.json'), JSON.stringify(compras, null, 4));
    res.status(200).json(compra);
});

router.get('/compras/:id', (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/compras.json'));
    let compras = JSON.parse(rawdata);
    let id = req.params.id;

    let retorno = compras.find(compra => compra._id === id);

    if (retorno) {
       res.status(200).json(retorno);
    } else {
        res.status(404).json({});        
    }
});


module.exports = {
    JsonServer: routerJsonServer,
    RouterExtra: router,
};
  /*
module.exports = routerJsonServer;*/