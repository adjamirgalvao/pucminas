const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require("fs");
const jsonServer = require('json-server');
const axios = require('axios');
const port = process.env.PORT || 3000;

function uniqueID() {
    return '' + (Math.floor(Math.random() * Date.now()))
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getObjeto(req, api, id) {
    try {
        //Aqui eu troco a porta porque com ng route eu posso fazer redirecionamento de porta.
        const host = req.headers.host.split(":")[0] + ':' + port;
        const protocol = req.protocol;
        const url = `${protocol}://${host}/mock/api/${api}/${id}`;
        // senão vai ser interceptado pelo routerJsonServer.render
        const config = { headers: { Authorization: 'Bearer mock_local' } };

        const response = await axios.get(url, config);
        console.log(url, response.data);
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
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwiaWF0IjoxNjc3MDgzNzU3LCJleHAiOjE2NzcwOTM3NTd9.QKlf0EEnOo-3TOLjll6m3HPL6sdTiSDvT7EVizqbpuE"
        });
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
            }
        });
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
    ; (async function gravarCompra() {
        if (compra.id_fornecedor) {
            compra.fornecedor = await getObjeto(req, 'fornecedores', compra.id_fornecedor);
        }
        for (let i in compra.itensCompra) {
            total += compra.itensCompra[i].preco;
            compra.itensCompra[i].id_compra = compra._id;
            compra.itensCompra[i]._id = uniqueID();
            compra.itensCompra[i].__v = 0;
        }

        compra.total = total;
        compra.__v = 0;
        compras.push(compra);

        fs.writeFileSync(path.join(__dirname, '../mock/compras.json'), JSON.stringify(compras, null, 4));
        res.status(201).json(compra);
    })();
});

router.get('/compras/:id', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/compras.json'));
    let compras = JSON.parse(rawdata);
    let id = req.params.id;

    let compra = compras.find(compra => compra._id === id);

    if (compra) {
        //sem isso não deixava executar, pois dizia que tinha que estar em top level o await
        ; (async function lerProduto() {
            for (let i in compra.itensCompra) {
                compra.itensCompra[i].produto = await getObjeto(req, 'produtos', compra.itensCompra[i].id_produto);
            }

            console.log(compra);
            res.status(200).json(compra);
        })();
    } else {
        res.status(404).json({});
    }
});

router.put('/compras/:id', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/compras.json'));
    let compras = JSON.parse(rawdata);
    let id = req.params.id;

    let compraRemovida = compras.find(compra => compra._id === id);

    if (compraRemovida) {
        //Remove a compra
        let comprasAtualizadas = compras.filter(compraRemovida => compraRemovida._id !== id);
        
        //Adiciona novamente
        let compra = req.body;
        let total = 0;
        compra._id = compraRemovida._id;
        ; (async function gravarCompra() {
            if (compra.id_fornecedor) {
                compra.fornecedor = await getObjeto(req, 'fornecedores', compra.id_fornecedor);
            }
            for (let i in compra.itensCompra) {
                total += compra.itensCompra[i].preco;
                compra.itensCompra[i].id_compra = compra._id;
                compra.itensCompra[i]._id = uniqueID();
                compra.itensCompra[i].__v = 0;
            }
    
            compra.total = total;
            compra.__v = 0;
            comprasAtualizadas.push(compra);

        fs.writeFileSync(path.join(__dirname, '../mock/compras.json'), JSON.stringify(comprasAtualizadas, null, 4));
        res.status(200).json(compra);
    })();        
    } else {
        res.status(404).json({});
    }
});

router.delete('/compras/:id', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/compras.json'));
    let compras = JSON.parse(rawdata);
    let id = req.params.id;

    let compra = compras.find(compra => compra._id === id);

    if (compra) {
        let comprasAtualizadas = compras.filter(compra => compra._id !== id);
        fs.writeFileSync(path.join(__dirname, '../mock/compras.json'), JSON.stringify(comprasAtualizadas, null, 4));
        res.status(200).json(compra);
    } else {
        res.status(404).json({});
    }
});

router.delete('/compras/:idCompra/itensCompra/:id', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/compras.json'));
    let compras = JSON.parse(rawdata);
    let id = req.params.id;

    let compra = compras.find(compra => compra._id === req.params.idCompra);

    let achou = false;
    if (compra) {
        //remove o item Compra
        const comprasAtualizadas = compras.map(compra => {
            if (compra.itensCompra) {
                let item = compra.itensCompra.find(item => item._id === id);
                achou = achou || (item);
                const itensFiltrados = compra.itensCompra.filter(item => item._id !== id);
                return { ...compra, itensCompra: itensFiltrados };
            }
            return compra;
        });
        if (achou) {
            fs.writeFileSync(path.join(__dirname, '../mock/compras.json'), JSON.stringify(comprasAtualizadas, null, 4));
            res.status(200).json(compra);
        } else {
            res.status(404).json({});
        }
    } else {
        res.status(404).json({});
    }
});

router.get('/vendas', (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/vendas.json'));
    let vendas = JSON.parse(rawdata);
    res.status(200).json(vendas);
});

router.post('/vendas', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/vendas.json'));
    let vendas = JSON.parse(rawdata);
    let venda = req.body;

    let total = 0;
    let custoTotal = 0;
    venda._id = uniqueID();
    ; (async function gravarVenda() {
        if (venda.id_vendedor) {
            venda.vendedor = await getObjeto(req, 'vendedores', venda.id_vendedor);
        }
        if (venda.id_cliente) {
            venda.cliente = await getObjeto(req, 'clientes', venda.id_cliente);
        }
        for (let i in venda.itensVenda) {
            total += venda.itensVenda[i].preco;
            custoTotal += venda.itensVenda[i].precoCusto * venda.itensVenda[i].quantidade;
            venda.itensVenda[i].id_venda = venda._id;
            venda.itensVenda[i]._id = uniqueID();
            venda.itensVenda[i].__v = 0;
        }

        venda.total = total;
        venda.custoTotal = custoTotal;
        venda.__v = 0;
        vendas.push(venda);

        fs.writeFileSync(path.join(__dirname, '../mock/vendas.json'), JSON.stringify(vendas, null, 4));
        res.status(201).json(venda);
    })();
});


router.get('/vendas/:id', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/vendas.json'));
    let vendas = JSON.parse(rawdata);
    let id = req.params.id;

    let venda = vendas.find(venda => venda._id === id);

    if (venda) {
        //sem isso não deixava executar, pois dizia que tinha que estar em top level o await
        ; (async function lerProduto() {
            for (let i in venda.itensVenda) {
                venda.itensVenda[i].produto = await getObjeto(req, 'produtos', venda.itensVenda[i].id_produto);
            }

            console.log(venda);
            res.status(200).json(venda);
        })();
    } else {
        res.status(404).json({});
    }
});

router.put('/vendas/:id', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/vendas.json'));
    let vendas = JSON.parse(rawdata);
    let id = req.params.id;

    let vendaRemovida = vendas.find(venda => venda._id === id);

    if (vendaRemovida) {
        //Remove a venda
        let vendasAtualizadas = vendas.filter(vendaRemovida => vendaRemovida._id !== id);
        
        //Adiciona novamente
        let venda = req.body;
        let total = 0;
        let custoTotal = 0;
        venda._id = vendaRemovida._id;
        ; (async function gravarVenda() {
            if (venda.id_vendedor) {
                venda.vendedor = await getObjeto(req, 'vendedores', venda.id_vendedor);
            }
            if (venda.id_cliente) {
                venda.cliente = await getObjeto(req, 'clientes', venda.id_cliente);
            }
            for (let i in venda.itensVenda) {
                total += venda.itensVenda[i].preco;
                custoTotal += venda.itensVenda[i].precoCusto * venda.itensVenda[i].quantidade;
                venda.itensVenda[i].id_venda = venda._id;
                venda.itensVenda[i]._id = uniqueID();
                venda.itensVenda[i].__v = 0;
            }
    
            venda.total = total;
            venda.custoTotal = custoTotal;
            venda.__v = 0;
            vendasAtualizadas.push(venda);
    
            fs.writeFileSync(path.join(__dirname, '../mock/vendas.json'), JSON.stringify(vendasAtualizadas, null, 4));
            res.status(200).json(venda);
        })();     
    } else {
        res.status(404).json({});
    }
});

router.delete('/vendas/:id', async (req, res) => {
    let rawdata = fs.readFileSync(path.join(__dirname, '../mock/vendas.json'));
    let vendas = JSON.parse(rawdata);
    let id = req.params.id;

    let venda = vendas.find(venda => venda._id === id);

    if (venda) {
        let vendasAtualizadas = vendas.filter(venda => venda._id !== id);
        fs.writeFileSync(path.join(__dirname, '../mock/vendas.json'), JSON.stringify(vendasAtualizadas, null, 4));
        res.status(200).json(venda);
    } else {
        res.status(404).json({});
    }
});

router.get('/vendas/consultas/indicadoresVendas', async (req, res) => {
    let retorno = [
        {
            _id: 2,
            custoTotal: 1019.51,
            vendasTotal: 522.3,
            lucroTotal: -497.21,
            numeroVendas: 5,
            ticketMedio: 104.46
        },
        {
            _id: 3,
            custoTotal: 519.51,
            vendasTotal: 1522.3,
            lucroTotal: 1002.79,
            numeroVendas: 10,
            ticketMedio: 152.23
        },
    ];
    res.status(200).json(retorno);
});

router.get('/vendas/consultas/produtosMaisVendidos', async (req, res) => {
    let retorno = [
        {
            _id: '63dffe84afbed74cc58ce0a1',
            precoTotal: 500,
            quantidade: 10,
            descontoTotal: 500,
            produto: {
                _id: '63dffe84afbed74cc58ce0a1',
                nome: 'SquickMellon',
                quantidade: 0,
                preco: 100,
                precoCusto: 90,
                precoCustoInicial: 90,
                __v: 0
            }
        },
        {
            _id: '63cf0cc478fa75fe3c95ecfb',
            precoTotal: 2,
            quantidade: 1,
            descontoTotal: 0,
            produto: {
                _id: '63cf0cc478fa75fe3c95ecfb',
                nome: 'Produto 3',
                quantidade: 0,
                preco: 2,
                precoCusto: 0,
                precoCustoInicial: 0,
                __v: 0
            }
        },
        {
            _id: '63cf0c4978fa75fe3c95ecf8',
            precoTotal: 19,
            quantidade: 2,
            descontoTotal: 1,
            produto: {
                _id: '63cf0c4978fa75fe3c95ecf8',
                nome: 'Produto 2',
                quantidade: 0,
                preco: 10,
                precoCusto: 10,
                precoCustoInicial: 0,
                __v: 0
            }
        },
        {
            _id: '63cf0c3978fa75fe3c95ecf5',
            precoTotal: 1.3,
            quantidade: 2,
            descontoTotal: 0.7,
            produto: {
                _id: '63cf0c3978fa75fe3c95ecf5',
                precoCustoInicial: 0,
                __v: 0,
                nome: 'Produto 1',
                preco: 1,
                precoCusto: 18.92,
                quantidade: 100
            }
        }
    ];
    res.status(200).json(retorno);
});

router.get('/produtos/:id/indicadoresCompras', async (req, res) => {
    let retorno = [
            {
                _id: 2,
                custoTotal: 2000,
                quantidadeTotalCompras: 100,
                numeroCompras: 1,
                custoMedio: 20,
                quantidadeTotalVendas: 10,
            },
            {
                _id: 3,
                custoTotal: 200,
                quantidadeTotal: 100,
                numeroCompras: 2,
                custoMedio: 2,
                quantidadeTotalVendas: 110,                
            },

    ];
    res.status(200).json(retorno);
});


router.get('/produtos/:id/listarItensCompras', async (req, res) => {
    let retorno = [
        {
            _id: "63eb02499c5455fba6c1cdc8",
            id_produto: "63cf0c4978fa75fe3c95ecf8",
            id_compra: "63eb02499c5455fba6c1cdc6",
            quantidade: 5,
            preco: 55,
            __v: 0,
            compra: {
                _id: "63eb02499c5455fba6c1cdc6",
                data: "2023-02-14T03:38:33.495Z",
                numero: "",
                id_fornecedor: "63cf2b43711ff977314cb05a",
                __v: 0
            },
            data: "2023-02-14T03:38:33.495Z"
        }
    ];
    res.status(200).json(retorno);
});

module.exports = {
    JsonServer: routerJsonServer,
    RouterExtra: router,
};
