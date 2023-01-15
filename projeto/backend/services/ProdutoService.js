const ProdutoModel = require("../models/ProdutoModel");
const { ItemCompraModel, Mongoose } = require("../models/ItemCompraModel");


function itemCompraInnerJoinCompra(id) {
  return  [
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
  }, { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'compra': {
            '$arrayElemAt': [
                '$compra', 0
            ]
        }
    }
  }, { // para virar inner join e não left join
    '$match': {
      'compra': {
          '$exists': true
      }
    }
  }  
];
}

module.exports = class ProdutoService {

  static async atualizarPrecoCustoAposEntrada(produto, entrada, session) {
    let quantidadeInicial = produto.quantidade;
  
    produto.quantidade = produto.quantidade + entrada.quantidade;
    produto.precoCusto = ((quantidadeInicial * produto.precoCusto) + (entrada.quantidade * (entrada.preco / entrada.quantidade))) / produto.quantidade;
    produto.precoCusto = Math.round(produto.precoCusto * 100) / 100; //arredondar em 2 digitos
  
    await ProdutoService.updateProduto(produto._id, produto, session);
  }
  
  static async atualizarPrecoCustoAposSaida(produto, saida, session) {
    let quantidadeInicial = produto.quantidade;
  
    produto.quantidade = produto.quantidade - saida.quantidade;
    if (produto.quantidade > 0) {
      produto.precoCusto = ((quantidadeInicial * produto.precoCusto) - (saida.quantidade * (saida.preco / saida.quantidade))) / produto.quantidade;
      produto.precoCusto = Math.round(produto.precoCusto * 100) / 100; //arredondar em 2 digitos
    } else {
      produto.precoCusto = produto.precoCustoInicial;
    } 
    await ProdutoService.updateProduto(produto._id, produto, session);
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

  static async addProduto(data, session) {
    try {
      const novo = {
        nome: data.nome,
        quantidade: data.quantidade,
        preco: data.preco,
        precoCusto: data.precoCusto,
        precoCustoInicial: data.precoCusto
      };
      const registro = await new ProdutoModel(novo).save({session});

      return registro;
    } catch (error) {
      console.log(error);
      throw new Error(`Produto não pode ser criado ${error.message}`);
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
    try {
      // Aqui eu tenho que criar o objeto porque essa função também é chamada de outro lugar
      const registro = await ProdutoModel.updateOne(
        { _id: id} , {nome : produto.nome, 
          quantidade: produto.quantidade, 
          preco : produto.preco, 
          precoCusto: produto.precoCusto}, {session});

      return registro;
    } catch (error) {
      console.log(`Produto ${id} não pode ser atualizado ${error.message}`);
      throw new Error(`Produto ${id} não pode ser atualizado ${error.message}`);
    }
  }

  static async deleteProduto(id, session) {
    try {
      const registro = await ProdutoModel.findOneAndDelete({ _id: id }, {session});

      return registro;
    } catch (error) {
      console.log(`Produto ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Produto ${id} não pode ser deletado ${error.message}`);
    }
  }

  static async getAllCompras(id) {
    try {
      const todos = await ItemCompraModel.aggregate(itemCompraInnerJoinCompra(id));
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error.message}`);
      throw new Error(`Erro ao recuperar Compras ${error.message}`);
    }
  }
};
