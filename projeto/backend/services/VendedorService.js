const VendedorModel = require("../models/VendedorModel");
const RelatorioUtilService = require("./RelatorioUtilService");

module.exports = class VendedorService {

  static async getAllVendedores() {
    try {
      const todos = await VendedorModel.find();
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Vendedores ${error.message}`);
      throw new Error(`Erro ao recuperar Vendedores ${error.message}`);
    }
  }

  static async addVendedor(data, session) {
    try {

      const novo =  {
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        salario: data.salario,
        endereco: data.endereco
    };
    const registro = await new VendedorModel(novo).save({session});

      return registro;
    } catch (error) {
      console.log(error);
      throw new Error(`Vendedor não pode ser criado ${error.message}`);
    }
  }

  static async getVendedorbyId(vendedorId) {
    try {
      const registro = await VendedorModel.findById(vendedorId);

      return registro;
    } catch (error) {
      console.log(`Vendedor ${vendedorId} não encontrado ${error.message}`);
      throw new Error(`Vendedor ${vendedorId} não encontrado ${error.message}`);
    }
  }

  static async getVendedorbyEmail(email) {
    let registro = null;
    try {
      const registros = await VendedorModel.find({ email: email });

      if (registros && registros.length == 1){
        registro = registros[0];
      }
      return registro;
    } catch (error) {
      console.log(`Vendedor ${vendedorId} não encontrado ${error.message}`);
      throw new Error(`Vendedor ${vendedorId} não encontrado ${error.message}`);
    }
  }

  static async updateVendedor(id, vendedor, session) {
    try {
      const registro = await VendedorModel.updateOne({ _id: id} , {... vendedor}, {session});

      return registro;
    } catch (error) {
      console.log(`Vendedor ${id} não pode ser atualizado ${error.message}`);
      throw new Error(`Vendedor ${id} não pode ser atualizado ${error.message}`);
    }
  }

  static async deleteVendedor(id, session) {
    try {
      const registro = await VendedorModel.findOneAndDelete({ _id: id }, {session});

      return registro;
    } catch (error) {
      console.log(`Vendedor ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Vendedor ${id} não pode ser deletado ${error.message}`);
    }
  }

  static async getRelatorioListagem() {
    try {
      let registros = await this.getAllVendedores();
      let html = RelatorioUtilService.gerarCabecalho('Listagem de Vendedores');
      html += RelatorioUtilService.gerarTabela(registros, ['nome', 'email', 'cpf', 'salario'], ['Nome', 'E-mail', 'CPF', 'Salário'], [null, null, RelatorioUtilService.getMascaraCPFCNPJ, RelatorioUtilService.getDinheiro]);
      html += RelatorioUtilService.gerarFim();

      return html;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de listagem ${error.message}`);
    }
  };

};
