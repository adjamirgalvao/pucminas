const CompraModel = require("../models/CompraModel");

module.exports = class CompraService {
  static async getAllCompras() {
    try {
      const todos = await CompraModel.find();
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error.message}`);
      throw new Error(`Erro ao recuperar Compras ${error.message}`);
    }
  }

  static async addCompra(data, session) {
    try {
      const novo = {
        data: data.data,
        numero: data.numero
      };
      const registro = await new CompraModel(novo).save({session});

      return registro;
    } catch (error) {
      console.log(error);
      throw new Error(`Compra não pode ser criada ${error.message}`);
    }
  }

  static async getComprabyId(id) {
    try {
      const registro = await CompraModel.findById(id);

      return registro;
    } catch (error) {
      console.log(`Compra ${id} não encontrada ${error.message}`);
      throw new Error(`Compra ${id} não encontrada ${error.message}`);
    }
  }

  static async updateCompra(id, compra, session) {
    try {
      const registro = await CompraModel.updateOne(
        { _id: id} , {...compra}, session);
    
      return registro;
    } catch (error) {
      console.log(`Compra ${id} não pode ser atualizada ${error.message}`);
      throw new Error(`Compra ${id} não pode ser atualizada ${error.message}`);
    }
  }

  static async deleteCompra(id) {
    try {
      const registro = await CompraModel.findOneAndDelete({ _id: id });

      return registro;
    } catch (error) {
      console.log(`Compra ${id} não pode ser deletada ${error.message}`);
      throw new Error(`Compra ${id} não pode ser deletada ${error.message}`);
    }
  }
};
