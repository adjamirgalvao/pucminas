const ProdutoModel = require("../models/ProdutoModel");

module.exports = class ProdutoService {
  static async getAllProdutos() {
    try {
      const allProdutos = await ProdutoModel.find();
      return allProdutos;
    } catch (error) {
      console.log(`Erro ao recuperar Produtos ${error}`);
    }
  }

  static async addProduto(data) {
    try {
      const newProduto = {
        nome: data.nome,
        quantidade: data.quantidade,
        preco: data.preco
      };
      const response = await new ProdutoModel(newProduto).save();
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  static async getProdutobyId(produtoId) {
    try {
      const produto = await Produto.findById({ _id: produtoId });
      return produto;
    } catch (error) {
      console.log(`Produto ${produtoId} não encontrado ${error}`);
    }
  }

  static async updateProduto(id, produto) {
    try {
      const updateResponse = await ProdutoModel.updateOne(
        { _id: id },
        { ...produto}
      );

      return updateResponse;
    } catch (error) {
      console.log(` Produto ${id} não pode ser atualizado ${error}`);
    }
  }

  static async deleteProduto(produtoId) {
    try {
      const deletedResponse = await ProdutoModel.findOneAndDelete({ _id: produtoId });
      return deletedResponse;
    } catch (error) {
      console.log(`Produto ${id} não pode ser deletado ${error}`);
    }
  }
};
