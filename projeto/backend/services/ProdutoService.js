const ProdutoModel = require("../models/ProdutoModel");
const { ItemCompraModel, Mongoose } = require("../models/ItemCompraModel");
const { ItemVendaModel } = require("../models/ItemVendaModel");
const RelatorioUtilService = require("./RelatorioUtilService");

function itemCompraInnerJoinCompra(id, ano, agrupar) {
  let retorno =  [
  {
    //https://stackoverflow.com/questions/36193289/moongoose-aggregate-match-does-not-match-ids
    '$match':{
      'id_produto': new Mongoose.Types.ObjectId(id)}
  },
  //compra
  {
    '$lookup': {
      'from': 'compras', 
      'localField': 'id_compra', 
      'foreignField': '_id', 
      'as': 'compra'
    }
  }, 
  // para fazer com que fique um campo e não uma lista
  { 
     '$addFields': {
        'compra': {
            '$arrayElemAt': [
                '$compra', 0
            ]
        }
    }
  }, 
  // para virar inner join e não left join
  { 
    '$match': {
      'compra': {
          '$exists': true
      }
    }
  }, 
  // Colocando a data para facilitar na hora de fazer o group by
  { 
    '$addFields': {
       'data':  '$compra.data'
    }
   },  
 ];
  // https://stackoverflow.com/questions/70289720/aggregate-query-by-year-and-month-in-mongodb
  if (ano) {
    retorno = [...retorno,   {
        $match: {
                  data: { $gte: new Date(ano +"-01-01"), $lte: new Date(ano + "-12-31") }
              }      
      }];
  }  
  if (agrupar) {
    retorno = [...retorno, 
        //https://stackoverflow.com/questions/27366209/group-and-count-by-month
        {$group: {
          _id: {$month: "$data"}, 
          custoTotal: {$sum: "$preco"}, 
          quantidadeTotalCompras: {$sum: "$quantidade"}, 
          numeroCompras: {$sum: 1 }, 
        }
      },
      {
      $addFields: {
        custoMedio: { $divide : [ '$custoTotal', '$quantidadeTotalCompras' ]}
        }  
      },
    //ordenação
    {$sort : { _id : 1 }}  ];
  }     
  return retorno;
}


function itemVendaInnerJoinVenda(id, ano, agrupar) {
  let retorno =  [
  {
    //https://stackoverflow.com/questions/36193289/moongoose-aggregate-match-does-not-match-ids
    '$match':{
      'id_produto': new Mongoose.Types.ObjectId(id)}
  },
  //venda
  {
    '$lookup': {
      'from': 'vendas', 
      'localField': 'id_venda', 
      'foreignField': '_id', 
      'as': 'venda'
    }
  }, 
  // para fazer com que fique um campo e não uma lista
  { 
     '$addFields': {
        'venda': {
            '$arrayElemAt': [
                '$venda', 0
            ]
        }
    }
  }, 
  // para virar inner join e não left join
  { 
    '$match': {
      'venda': {
          '$exists': true
      }
    }
  }, 
  // Colocando a data para facilitar na hora de fazer o group by
  { 
    '$addFields': {
       'data':  '$venda.data'
    }
   },  
 ];
  // https://stackoverflow.com/questions/70289720/aggregate-query-by-year-and-month-in-mongodb
  if (ano) {
    retorno = [...retorno,   {
        $match: {
                  data: { $gte: new Date(ano +"-01-01"), $lte: new Date(ano + "-12-31") }
              }      
      }];
  }  
  if (agrupar) {
    retorno = [...retorno, 
        //https://stackoverflow.com/questions/27366209/group-and-count-by-month
        {$group: {
          _id: {$month: "$data"}, 
          vendasTotal: {$sum: "$preco"}, 
          quantidadeTotalVendas: {$sum: "$quantidade"}, 
          numeroVendas: {$sum: 1 }, 
        }
      },
    //ordenação
    {$sort : { _id : 1 }}  ];
  }     
  return retorno;
}

module.exports = class ProdutoService {

  static async atualizarPrecoCustoAposEntrada(produto, entrada, session) {
    let quantidadeInicial = produto.quantidade;
  
    produto.quantidade = produto.quantidade + entrada.quantidade;
    produto.precoCusto = ((quantidadeInicial * produto.precoCusto) + entrada.preco) / produto.quantidade;
    produto.precoCusto = Math.round(produto.precoCusto * 100) / 100; //arredondar em 2 digitos
  
    //sem o '' caso passe um id como ObjectId dá erro na comparação de produtos
    await ProdutoService.updateProduto(produto._id + '', produto, session);
  }
  
  static async atualizarPrecoCustoAposSaida(produto, saida, session) {
    let quantidadeInicial = produto.quantidade;
  
    produto.quantidade = produto.quantidade - saida.quantidade;
    if (produto.quantidade > 0) {
      produto.precoCusto = ((quantidadeInicial * produto.precoCusto) - saida.preco) / produto.quantidade;
      //https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
      produto.precoCusto = Math.round(produto.precoCusto * 100) / 100; //arredondar em 2 digitos
    } else if (produto.quantidade == 0){
      produto.precoCusto = produto.precoCustoInicial;
    }  else {
      throw new Error(`O produto '${produto.nome}' não pode ser atualizado, pois o saldo ficará negativo!`)
    }
    //sem o '' caso passe um id como ObjectId dá erro na comparação de produtos
    await ProdutoService.updateProduto(produto._id + '', produto, session);
  }
  
  static async getAllProdutos() {
    try {
      const todos = await ProdutoModel.find();
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Produtos ${error.message}`);
      throw new Error(`Erro ao recuperar Produtos ${error.message}`);
    }
  }

  static async getAllProdutosComSaldo() {
    try {
      const todos = await ProdutoModel.find({quantidade: {$gt: 0}});
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Produtos ${error.message}`);
      throw new Error(`Erro ao recuperar Produtos ${error.message}`);
    }
  }

  static async addProduto(data, session) {
    let erro = false;
    try {
      const novo = {
        nome: data.nome.trim(),
        quantidade: data.quantidade,
        preco: data.preco,
        precoCusto: data.precoCusto,
        precoCustoInicial: data.precoCusto
      };
      //https://stackoverflow.com/questions/33627238/mongoose-find-with-multiple-conditions
      let produto = await ProdutoModel.findOne({ nome: { $regex: RelatorioUtilService.escapeRegExp(novo.nome.trim()), $options: 'i'} });
      if (produto) {
        erro = true;
        throw new Error('Produto não pode ser criado pois já existe um produto com o mesmo nome.');
      } 
      const registro = await new ProdutoModel(novo).save({session});

      return registro;
    } catch (error) {
      console.log(error);
      if (erro) {
        throw new Error(error.message);
      } else {
        throw new Error(`Produto não pode ser criado ${error.message}`);
      }  
    }
  }

  static async getProdutobyId(produtoId, session) {
    try {
      const registro = await ProdutoModel.findById(produtoId).session(session);

      return registro;
    } catch (error) {
      console.log(`Produto ${produtoId} não encontrado ${error.message}`);
      throw new Error(`Produto ${produtoId} não encontrado ${error.message}`);
    }
  }

  static async updateProduto(id, produto, session) {
    let erro = false;
    try {
      let produtoAntigo = await ProdutoModel.findOne({ nome: { $regex: RelatorioUtilService.escapeRegExp(produto.nome.trim()), $options: 'i'} }).session(session);
      if (produtoAntigo && (produtoAntigo._id != id)) {
        erro = true;
        throw new Error('Produto não pode ser alterado pois já existe um produto com mesmo nome.');
      }
      // Aqui eu tenho que criar o objeto porque essa função também é chamada de outro lugar
      const registro = await ProdutoModel.updateOne(
        { _id: id} , {nome : produto.nome, 
          quantidade: produto.quantidade, 
          preco : produto.preco, 
          precoCusto: produto.precoCusto}, {session});

      return registro;
    } catch (error) {
      console.log(`Produto ${id} não pode ser atualizado ${error.message}`);
      if (erro) {
        throw new Error(error.message);
      } else {      
        throw new Error(`Produto ${id} não pode ser atualizado ${error.message}`);
      }  
    }
  }

  static async deleteProduto(id, session) {
    try {
      let itemCompra = await ItemCompraModel.findOne({id_produto : id});
      let itemVenda = await ItemVendaModel.findOne({id_produto : id});
      if (itemCompra || itemVenda){
        throw new Error(`, pois possui compra ou venda.`);
      } else {  
        const registro = await ProdutoModel.findOneAndDelete({ _id: id }, {session});
        return registro;
      }  
    } catch (error) {
      console.log(`Produto não pode ser excluído${error.message}`);
      throw new Error(`Produto não pode ser excluído${error.message}`);
    }
  }

  static async getAllItensCompras(id, ano, agrupar) {
    try {
      const todos = await ItemCompraModel.aggregate(itemCompraInnerJoinCompra(id, ano, agrupar));
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error.message}`);
      throw new Error(`Erro ao recuperar Compras ${error.message}`);
    }
  }

  static async getAllItensVendas(id, ano, agrupar) {
    try {
      const todos = await ItemVendaModel.aggregate(itemVendaInnerJoinVenda(id, ano, agrupar));
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Vendas ${error.message}`);
      throw new Error(`Erro ao recuperar Vendas ${error.message}`);
    }
  }

  static async getIndicadoresCompras(id, ano){
    const todosCompras = await this.getAllItensCompras(id, ano,true);
    const todosVendas = await this.getAllItensVendas(id, ano,true);

    let todosDados = [];
    // Percorre todosCompras e adiciona os objetos correspondentes de todosVendas
    for (let compra of todosCompras) {
      let venda = todosVendas.find(v => v._id === compra._id);
      if (!venda) {
        venda = { _id: compra._id, quantidadeTotalVendas: 0 };
      }
      todosDados.push({
        _id: compra._id,
        quantidadeTotalCompras: compra.quantidadeTotalCompras,
        custoTotal: compra.custoTotal,
        numeroCompras: compra.numeroCompras,
        custoMedio: compra.custoMedio,
        quantidadeTotalVendas: venda.quantidadeTotalVendas,
      });
    }
    
    // Percorre todosVendas e adiciona os objetos que não foram adicionados anteriormente
    for (let venda of todosVendas) {
      let compra = todosCompras.find(c => c._id === venda._id);
      if (!compra) {
        compra = { _id: venda._id, quantidadeTotalCompras: 0, custoTotal: 0, numeroCompra: 0, custoMedio: 0 };
        todosDados.push({
          _id: venda._id,
          quantidadeTotalCompras: compra.quantidadeTotalCompras,
          custoTotal: compra.custoTotal,
          numeroCompras: compra.numeroCompras,
          custoMedio: compra.custoMedio,
          quantidadeTotalVendas: venda.quantidadeTotalVendas,
        });
      }
    }
    return todosDados;    
  }

  static async getRelatorioListagem() {
    try {
      let registros = await this.getAllProdutos();
      let html = RelatorioUtilService.gerarCabecalho('Listagem de Produtos');
      html += RelatorioUtilService.gerarTabela(registros, ['nome', 'quantidade', 'preco', 'precoCusto'], ['Nome', 'Qtd. Estoque', 'Preço Unitário', 'Preço de Custo'], [null, null, RelatorioUtilService.getDinheiro, RelatorioUtilService.getDinheiro]);
      html += RelatorioUtilService.gerarFim();

      return html;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de listagem ${error.message}`);
    }
  }

  static async getExcelListagem() {
    try {
      let retorno = [];
      let registros = await this.getAllProdutos();
      for (let i in registros){
        retorno.push({nome: registros[i].nome, 
                      estoque: registros[i].quantidade, 
                      preco: registros[i].preco,
                      precoCusto: registros[i].precoCusto,
                      });
      }
      return retorno;
    } catch (error) {
      throw new Error(`Erro ao gerar dados de listagem ${error.message}`);
    }
  };  
};

