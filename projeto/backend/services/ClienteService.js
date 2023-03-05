const ClienteModel = require("../models/ClienteModel");
const { VendaModel } = require("../models/VendaModel");
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
    let erro = false;
    try {

      const novo = {
        nome: data.nome.trim(),
        dataNascimento: data.dataNascimento,
        email: data.email.trim(),
        cpf: data.cpf.trim(),
        endereco: data.endereco
      };
      //https://stackoverflow.com/questions/33627238/mongoose-find-with-multiple-conditions
      let cliente = await ClienteModel.findOne({ $or: [{ nome: { $regex: novo.nome.trim(), $options: 'i'} }, { email: { $regex: novo.email.trim(), $options: 'i'} }, { cpf: novo.cpf.trim() }] });
      if (cliente) {
        erro = true;
        throw new Error('Cliente não pode ser criado pois já existe um cliente com o mesmo nome, cpf ou e-mail.');
      } 
      const registro = await new ClienteModel(novo).save({ session });

      return registro;
    } catch (error) {
      console.log(error);
      if (erro) {
        throw new Error(error.message);
      } else {
        throw new Error(`Cliente não pode ser criado ${error.message}`);
      }  
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
 
  static async findOne(consulta) {
    return await ClienteModel.findOne(consulta);
  }

  static async updateCliente(id, cliente, session) {
    let erro = false;
    try {
      let clientes = await ClienteModel.find({ $or: [{ nome: { $regex: cliente.nome.trim(), $options: 'i'} }, { email: { $regex: cliente.email.trim(), $options: 'i'} }, { cpf: cliente.cpf.trim() }] });
      if (clientes) {
        for (let i in clientes){
          if (clientes[i]._id != id) {
            erro = true;
            throw new Error('Cliente não pode ser alterado pois já existe um cliente com o mesmo nome, cpf ou e-mail.');
          }
        }
      }
      const registro = await ClienteModel.updateOne({ _id: id }, { ...cliente }, { session });

      return registro;
    } catch (error) {
      console.log(`Cliente ${id} não pode ser atualizado ${error.message}`);
      if (erro) {
        throw new Error(error.message);
      } else {   
        throw new Error(`Cliente ${id} não pode ser atualizado ${error.message}`);
      }  
    }
  }

  static async deleteCliente(id, session) {
    try {
      let venda = await VendaModel.findOne({id_cliente : id});

      if (venda){
        throw new Error(`, pois possui compra.`);
      } else {            
        const registro = await ClienteModel.findOneAndDelete({ _id: id }, { session });
        return registro;
      }
    } catch (error) {
      console.log(`Cliente não pode ser excluído ${error.message}`);
      throw new Error(`Cliente não pode ser excluído ${error.message}`);
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

  static async getExcelListagem() {
    try {
      let retorno = [];
      let registros = await this.getAllClientes();
      for (let i in registros){
        retorno.push({nome: registros[i].nome, 
                      email: registros[i].email, 
                      cpf: RelatorioUtilService.getMascaraCPFCNPJ(registros[i].cpf),
                      dataNascimento: RelatorioUtilService.getDataFormatada(registros[i].dataNascimento),  
                      logradouro: registros[i].endereco.rua,
                      numero: registros[i].endereco.numero,
                      complemento:registros[i].endereco.complemento,
                      });
      }
      return retorno;
    } catch (error) {
      throw new Error(`Erro ao gerar dados de listagem ${error.message}`);
    }
  };  
};
