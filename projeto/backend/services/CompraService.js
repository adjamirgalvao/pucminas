const CompraModel = require("../models/CompraModel");

module.exports = class CompraService {
  static async getAllCompras() {
    try {
      const allCompras = await CompraModel.find();
      
      return allCompras;
    } catch (error) {
      console.log(`Erro ao recuperar NotasFiscaisCompras ${error.message}`);
      throw new Error(`Erro ao recuperar NotasFiscaisCompras ${error.message}`);
    }
  }

  static async addCompra(data, session) {
    try {
      const novaNota = {
        data: data.data,
        numero: data.numero
      };
      const response = await new CompraModel(novaNota).save({session});

      return response;
    } catch (error) {
      console.log(error);
      throw new Error(`Compra não pode ser criada ${error.message}`);
    }
  }

  static async getComprabyId(id) {
    try {
      const compra = await CompraModel.findById(id);

      return compra;
    } catch (error) {
      console.log(`Compra ${id} não encontrada ${error.message}`);
      throw new Error(`Compra ${id} não encontrada ${error.message}`);
    }
  }

  static async updateCompra(id, nota, session) {
    try {
      const updateResponse = await CompraModel.updateOne(
        { _id: id} , {data : nota.data, 
                      numero: nota.numero}, session);
    
      return updateResponse;
    } catch (error) {
      console.log(`Compra ${id} não pode ser atualizada ${error.message}`);
      throw new Error(`Compra ${id} não pode ser atualizada ${error.message}`);
    }
  }

  static async deleteCompra(id) {
    try {
      const deletedResponse = await CompraModel.findOneAndDelete({ _id: id });

      return deletedResponse;
    } catch (error) {
      console.log(`Compra ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Compra ${id} não pode ser deletado ${error.message}`);
    }
  }
};
