const CompraModel = require("../models/CompraModel");

module.exports = class CompraService {
  static async getAllCompras() {
    try {
      const allCompras = await CompraModel.find();
      
      return allCompras;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error}`);
    }
  }

  static async addCompra(data) {
    try {
      const novaCompra = {
        id_produto : data.id_produto,
        data: data.data,
        quantidade: data.quantidade,
        preco: data.preco
      };
      const response = await new CompraModel(novaCompra).save();

      return response;
    } catch (error) {
      console.log(error);
      throw new Error(`Compra não pode ser criada ${error}`);
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
