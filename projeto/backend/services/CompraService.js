const {CompraModel, Mongoose} = require("../models/CompraModel");
const ProdutoService = require("./ProdutoService");

const compraProdutoJoin = [
  {
    '$lookup': {
      'from': 'produtos', 
      'localField': 'id_produto', 
      'foreignField': '_id', 
      'as': 'produto'
    }
  }
];

module.exports = class CompraService {

  static async criarCompra(data, session) {
    const novaCompra = {
      id_produto: data.id_produto,
      data: data.data,
      quantidade: data.quantidade,
      preco: data.preco
    };

    const response = await new CompraModel(novaCompra).save({session});

    return response;
  }

  static async atualizarPrecoCustoAposCompra(produto, compra, session) {
    let quantidadeInicial = produto.quantidade;

    produto.quantidade = produto.quantidade + compra.quantidade;
    produto.precoCusto = ((quantidadeInicial * produto.precoCusto) + (compra.quantidade * (compra.preco / compra.quantidade))) / produto.quantidade;
    await ProdutoService.updateProduto(produto._id, produto, session);
  }

  static async getAllCompras() {
    try {

      const allCompras = await CompraModel.aggregate(compraProdutoJoin);
      
      return allCompras;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error}`);
      throw new Error(`Erro ao recuperar Compras ${error}`);
    }
  }

  // session no mongoose https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js/
  static async addCompra(data) {
    const session = await Mongoose.startSession();
    
    session.startTransaction();
    try {

      const response = await CompraService.criarCompra(data, session);
      const produto = await ProdutoService.getProdutobyId(data.id_produto, session);

      if (produto != null) {
        await CompraService.atualizarPrecoCustoAposCompra(produto, response, session);
         await session.commitTransaction();
      } else {
        throw new Error(`Produto ${data.id_produto} não cadastrado`);
      }

      return response;
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw new Error(`Compra não pode ser criada ${error}`);
    } finally {
      session.endSession();
    }
  }

  static async getComprabyId(compraId) {
    try {
      const Compra = await CompraModel.findById(compraId);

      return Compra;
    } catch (error) {
      console.log(`Compra ${compraId} não encontrada ${error}`);
      throw new Error(`Compra ${compraId} não encontrada ${error}`);
    }
  }

  static async deleteCompra(compraId) {
    try {
      const deletedResponse = await CompraModel.findOneAndDelete({ _id: compraId });

      return deletedResponse;
    } catch (error) {
      console.log(`Compra ${id} não pode ser deletada ${error}`);
      throw new Error(`Compra ${id} não pode ser deletada ${error}`);
    }
  }
};
