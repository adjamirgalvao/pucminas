const NotaFiscalCompraModel = require("../models/NotaFiscalCompraModel");

module.exports = class NotaFiscalCompraService {
  static async getAllNotaFiscalCompras() {
    try {
      const allNotaFiscalCompras = await NotaFiscalCompraModel.find();
      
      return allNotaFiscalCompras;
    } catch (error) {
      console.log(`Erro ao recuperar NotasFiscaisCompras ${error.message}`);
      throw new Error(`Erro ao recuperar NotasFiscaisCompras ${error.message}`);
    }
  }

  static async addNotaFiscalCompra(data, session) {
    try {
      const novaNota = {
        data: data.data,
        numero: data.numero
      };
      const response = await new NotaFiscalCompraModel(novaNota).save({session});

      return response;
    } catch (error) {
      console.log(error);
      throw new Error(`NotaFiscalCompra não pode ser criada ${error.message}`);
    }
  }

  static async getNotaFiscalComprabyId(id) {
    try {
      const NotaFiscalCompra = await NotaFiscalCompraModel.findById(id);

      return NotaFiscalCompra;
    } catch (error) {
      console.log(`NotaFiscalCompra ${id} não encontrada ${error.message}`);
      throw new Error(`NotaFiscalCompra ${id} não encontrada ${error.message}`);
    }
  }

  static async updateNotaFiscalCompra(id, nota, session) {
    try {
      const updateResponse = await NotaFiscalCompraModel.updateOne(
        { _id: id} , {data : nota.data, 
                      numero: nota.numero}, session);
    
      return updateResponse;
    } catch (error) {
      console.log(`NotaFiscalCompra ${id} não pode ser atualizada ${error.message}`);
      throw new Error(`NotaFiscalCompra ${id} não pode ser atualizada ${error.message}`);
    }
  }

  static async deleteNotaFiscalCompra(id) {
    try {
      const deletedResponse = await NotaFiscalCompraModel.findOneAndDelete({ _id: id });

      return deletedResponse;
    } catch (error) {
      console.log(`NotaFiscalCompra ${id} não pode ser deletado ${error.message}`);
      throw new Error(`NotaFiscalCompra ${id} não pode ser deletado ${error.message}`);
    }
  }
};
