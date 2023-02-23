const ProdutoModel = require("../models/ProdutoModel");
const { ItemCompraModel, Mongoose } = require("../models/ItemCompraModel");
const { ItemVendaModel } = require("../models/ItemVendaModel");
const RelatorioUtilService = require("./RelatorioUtilService");

function itemCompraInnerJoinCompra(id, ano, agrupar) {
  let retorno =  [
  {
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
          quantidadeTotal: {$sum: "$quantidade"}, 
          numeroCompras: {$sum: 1 }, 
        }
      },
      {
      $addFields: {
        custoMedio: { $divide : [ '$custoTotal', '$quantidadeTotal' ]}
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
    produto.precoCusto = ((quantidadeInicial * produto.precoCusto) + (entrada.quantidade * (entrada.preco / entrada.quantidade))) / produto.quantidade;
    produto.precoCusto = Math.round(produto.precoCusto * 100) / 100; //arredondar em 2 digitos
  
    //sem o '' caso passe um id como ObjectId dá erro na comparação de produtos
    await ProdutoService.updateProduto(produto._id + '', produto, session);
  }
  
  static async atualizarPrecoCustoAposSaida(produto, saida, session) {
    let quantidadeInicial = produto.quantidade;
  
    produto.quantidade = produto.quantidade - saida.quantidade;
    if (produto.quantidade > 0) {
      produto.precoCusto = ((quantidadeInicial * produto.precoCusto) - (saida.quantidade * (saida.preco / saida.quantidade))) / produto.quantidade;
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
      let produto = await ProdutoModel.findOne({ nome: novo.nome.trim() });
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

  static async getProdutobyId(produtoId) {
    try {
      const registro = await ProdutoModel.findById(produtoId);

      return registro;
    } catch (error) {
      console.log(`Produto ${produtoId} não encontrado ${error.message}`);
      throw new Error(`Produto ${produtoId} não encontrado ${error.message}`);
    }
  }

  static async updateProduto(id, produto, session) {
    let erro = false;
    try {
      let produtoAntigo = await ProdutoModel.findOne({ nome: produto.nome.trim() });
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
        throw new Error(`. Possui compra ou venda.`);
      } else {  
        const registro = await ProdutoModel.findOneAndDelete({ _id: id }, {session});
        return registro;
      }  
    } catch (error) {
      console.log(`Produto ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Produto ${id} não pode ser deletado ${error.message}`);
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

