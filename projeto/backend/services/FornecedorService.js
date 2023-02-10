const FornecedorModel = require("../models/FornecedorModel");
const RelatorioUtilService = require("./RelatorioUtilService");

function getTipo(tipo) {
  if (tipo) {
    if (tipo == 'pf') {
      return 'Pessoa Física';
    } else {
      return 'Pessoa Jurídica';
    }
  } else {
    return '';
  }
}

module.exports = class FornecedorService {

  static async getAllFornecedores() {
    try {
      const todos = await FornecedorModel.find();

      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Fornecedores ${error.message}`);
      throw new Error(`Erro ao recuperar Fornecedores ${error.message}`);
    }
  }

  static async addFornecedor(data, session) {
    try {

      const novo = {
        nome: data.nome,
        tipo: data.tipo,
        identificacao: data.identificacao,
        endereco: data.endereco
      };
      const registro = await new FornecedorModel(novo).save({ session });

      return registro;
    } catch (error) {
      console.log(error);
      throw new Error(`Fornecedor não pode ser criado ${error.message}`);
    }
  }

  static async getFornecedorbyId(fornecedorId) {
    try {
      const registro = await FornecedorModel.findById(fornecedorId);

      return registro;
    } catch (error) {
      console.log(`Fornecedor ${fornecedorId} não encontrado ${error.message}`);
      throw new Error(`Fornecedor ${fornecedorId} não encontrado ${error.message}`);
    }
  }

  static async updateFornecedor(id, fornecedor, session) {
    try {
      const registro = await FornecedorModel.updateOne({ _id: id }, { ...fornecedor }, { session });

      return registro;
    } catch (error) {
      console.log(`Fornecedor ${id} não pode ser atualizado ${error.message}`);
      throw new Error(`Fornecedor ${id} não pode ser atualizado ${error.message}`);
    }
  }

  static async deleteFornecedor(id, session) {
    try {
      const registro = await FornecedorModel.findOneAndDelete({ _id: id }, { session });

      return registro;
    } catch (error) {
      console.log(`Fornecedor ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Fornecedor ${id} não pode ser deletado ${error.message}`);
    }
  }

  static async getRelatorioListagem() {
    try {
      let registros = await this.getAllFornecedores();
      let html = RelatorioUtilService.gerarCabecalho('Listagem de Fornecedores');
      html += RelatorioUtilService.gerarTabela(registros, ['nome', 'tipo', 'identificacao'], ['Nome', 'Tipo', 'Identificação'], [null, getTipo, RelatorioUtilService.getMascaraCPFCNPJ]);
      html += RelatorioUtilService.gerarFim();

      return html;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de listagem ${error.message}`);
    }
  };
};
