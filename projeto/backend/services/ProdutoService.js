const ProdutoModel = require("../models/ProdutoModel");
const { CompraModel } = require("../models/CompraModel");

module.exports = class ProdutoService {
  static async getAllProdutos() {
    try {
      const allProdutos = await ProdutoModel.find();
      
      return allProdutos;
    } catch (error) {
      console.log(`Erro ao recuperar Produtos ${error.message}`);
      throw new Error(`Erro ao recuperar Produtos ${error.message}`);
    }
  }

  static async addProduto(data, session) {
    try {
      const novoProduto = {
        nome: data.nome,
        quantidade: data.quantidade,
        preco: data.preco,
        precoCusto: data.precoCusto,
        precoCustoInicial: data.precoCusto
      };
      const response = await new ProdutoModel(novoProduto).save({session});

      return response;
    } catch (error) {
      console.log(error);
      throw new Error(`Produto não pode ser criado ${error.message}`);
    }
  }

  static async getProdutobyId(produtoId) {
    try {
      const produto = await ProdutoModel.findById(produtoId);

      return produto;
    } catch (error) {
      console.log(`Produto ${produtoId} não encontrado ${error.message}`);
      throw new Error(`Produto ${produtoId} não encontrado ${error.message}`);
    }
  }

  static async updateProduto(id, produto, session) {
    try {
      const updateResponse = await ProdutoModel.updateOne(
        { _id: id} , {nome : produto.nome, 
                      quantidade: produto.quantidade, 
                      preco : produto.preco, 
                      precoCusto: produto.precoCusto}, {session});

      return updateResponse;
    } catch (error) {
      console.log(`Produto ${id} não pode ser atualizado ${error.message}`);
      throw new Error(`Produto ${id} não pode ser atualizado ${error.message}`);
    }
  }

  static async deleteProduto(id, session) {
    try {
      const deletedResponse = await ProdutoModel.findOneAndDelete({ _id: id }, {session});

      return deletedResponse;
    } catch (error) {
      console.log(`Produto ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Produto ${id} não pode ser deletado ${error.message}`);
    }
  }

  static async getAllCompras(id) {
    try {
      const allCompras = await CompraModel.find({id_produto : id});
      
      return allCompras;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error.message}`);
      throw new Error(`Erro ao recuperar Compras ${error.message}`);
    }
  }
};
