const ClienteModel = require("../models/ClienteModel");
const RelatorioUtilService = require("./RelatorioUtilService");

module.exports = class ClienteService {

  static async getAllClientes() {
    try {
      const todos = await ClienteModel.find();
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Clientes ${error.message}`);
      throw new Error(`Erro ao recuperar Clientes ${error.message}`);
    }
  }

  static async addCliente(data, session) {
    try {

      const novo =  {
        nome: data.nome,
        dataNascimento: data.dataNascimento,
        email: data.email,
        cpf: data.cpf,
        endereco: data.endereco
    };
    const registro = await new ClienteModel(novo).save({session});

      return registro;
    } catch (error) {
      console.log(error);
      throw new Error(`Cliente não pode ser criado ${error.message}`);
    }
  }

  static async getClientebyId(clienteId) {
    try {
      const registro = await ClienteModel.findById(clienteId);

      return registro;
    } catch (error) {
      console.log(`Cliente ${clienteId} não encontrado ${error.message}`);
      throw new Error(`Cliente ${clienteId} não encontrado ${error.message}`);
    }
  }

  static async updateCliente(id, cliente, session) {
    try {
      const registro = await ClienteModel.updateOne({ _id: id} , {... cliente}, {session});

      return registro;
    } catch (error) {
      console.log(`Cliente ${id} não pode ser atualizado ${error.message}`);
      throw new Error(`Cliente ${id} não pode ser atualizado ${error.message}`);
    }
  }

  static async deleteCliente(id, session) {
    try {
      const registro = await ClienteModel.findOneAndDelete({ _id: id }, {session});

      return registro;
    } catch (error) {
      console.log(`Cliente ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Cliente ${id} não pode ser deletado ${error.message}`);
    }
  }

  static async getRelatorioListagem() {
    try {
      let registros = await this.getAllClientes();
      let html = RelatorioUtilService.gerarCabecalho('Listagem de Clientes');
      html += RelatorioUtilService.gerarTabela(registros, ['nome', 'email', 'cpf', 'dataNascimento'], ['Nome', 'E-mail', 'CPF', 'Data de Nascimento'], [null, null, RelatorioUtilService.getMascaraCPFCNPJ, RelatorioUtilService.getDataFormatada]);
      html += RelatorioUtilService.gerarFim();

      return html;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de listagem ${error.message}`);
    }
  };
};
