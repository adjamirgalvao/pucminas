const ProdutoModel = require("../models/ProdutoModel");

module.exports = class ProdutoService {
  static async getAllProdutos() {
    try {
      const allProdutos = await ProdutoModel.find();
      
      return allProdutos;
    } catch (error) {
      console.log(`Erro ao recuperar Produtos ${error}`);
      throw new Error(`Erro ao recuperar Produtos ${error}`);
    }
  }

  static async addProduto(data) {
    try {
      const novoProduto = {
        nome: data.nome,
        quantidade: data.quantidade,
        preco: data.preco,
        precoCusto: data.precoCusto
      };
      const response = await new ProdutoModel(novoProduto).save();

      return response;
    } catch (error) {
      console.log(error);
      throw new Error(`Produto não pode ser criado ${error}`);
    }
  }

  static async getProdutobyId(produtoId) {
    try {
      const produto = await ProdutoModel.findById(produtoId);

      return produto;
    } catch (error) {
      console.log(`Produto ${produtoId} não encontrado ${error}`);
      throw new Error(`Produto ${produtoId} não encontrado ${error}`);
    }
  }

  static async updateProduto(id, produto, session) {
    try {
      const updateResponse = await ProdutoModel.updateOne(
        { _id: id} , {nome : produto.nome, 
                      quantidade: produto.quantidade, 
                      preco : produto.preco, 
                      precoCusto: produto.precoCusto}, {session});
      console.log(updateResponse);

      return updateResponse;
    } catch (error) {
      console.log(`Produto ${id} não pode ser atualizado ${error}`);
      throw new Error(`Produto ${id} não pode ser atualizado ${error}`);
    }
  }

  static async deleteProduto(produtoId) {
    try {
      const deletedResponse = await ProdutoModel.findOneAndDelete({ _id: produtoId });

      return deletedResponse;
    } catch (error) {
      console.log(`Produto ${id} não pode ser deletado ${error}`);
      throw new Error(`Produto ${id} não pode ser deletado ${error}`);
    }
  }
};
