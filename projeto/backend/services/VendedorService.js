const VendedorModel = require("../models/VendedorModel");
const { VendaModel } = require("../models/VendaModel");
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
    let erro = false;
    try {

      const novo =  {
        nome: data.nome.trim(),
        cpf: data.cpf.trim(),
        email: data.email.trim(),
        salario: data.salario,
        endereco: data.endereco
      };
      //https://stackoverflow.com/questions/33627238/mongoose-find-with-multiple-conditions
      let vendedor = await VendedorModel.findOne({ $or: [{ nome: novo.nome.trim() }, { email: novo.email.trim() }, { cpf: novo.cpf.trim() }] });
      if (vendedor) {
        erro = true;
        throw new Error('Vendedor não pode ser criado pois já existe um vendedor com o mesmo nome, cpf ou e-mail.');
      } 
      const registro = await new VendedorModel(novo).save({session});

      return registro;
    } catch (error) {
      console.log(error);
      if (erro) {
        throw new Error(error.message);
      } else {
        throw new Error(`Vendedor não pode ser criado ${error.message}`);
      }  
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
    try {
      const registro = await VendedorModel.findOne({ email: email });

      return registro;
    } catch (error) {
      console.log(`Vendedor ${vendedorId} não encontrado ${error.message}`);
      throw new Error(`Vendedor ${vendedorId} não encontrado ${error.message}`);
    }
  }

  static async updateVendedor(id, vendedor, session) {
    let erro = false;
    try {
      let vendedores = await VendedorModel.find({ $or: [{ nome: vendedor.nome.trim() }, { email: vendedor.email.trim() }, { cpf: vendedor.cpf.trim() }] });
      if (vendedores) {
        for (let i in vendedores){
          if (vendedores[i]._id != id) {
            erro = true;
            throw new Error('Vendedor não pode ser alterado pois já existe um vendedor com o mesmo nome, cpf ou e-mail.');
          }
        }
      }
      const registro = await VendedorModel.updateOne({ _id: id} , {... vendedor}, {session});

      return registro;
    } catch (error) {
      console.log(`Vendedor ${id} não pode ser atualizado ${error.message}`);
      if (erro) {
        throw new Error(error.message);
      } else {      
        throw new Error(`Vendedor ${id} não pode ser atualizado ${error.message}`);
      }  
    }
  }

  static async deleteVendedor(id, session) {
    try {
      let venda = await VendaModel.findOne({id_vendedor : id});

      if (venda){
        throw new Error(`. Possui venda.`);
      } else {         
        const registro = await VendedorModel.findOneAndDelete({ _id: id }, {session});
        return registro;
      }  
    } catch (error) {
      console.log(`Vendedor não pode ser excluído ${error.message}`);
      throw new Error(`Vendedor não pode ser excluído ${error.message}`);
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

  static async getExcelListagem() {
    try {
      let retorno = [];
      let registros = await this.getAllVendedores();
      console.log(registros);
      for (let i in registros){
        retorno.push({nome: registros[i].nome, 
                      email: registros[i].email, 
                      cpf: RelatorioUtilService.getMascaraCPFCNPJ(registros[i].cpf),
                      salario: registros[i].salario,  
                      logradouro: registros[i].endereco.rua,
                      numero: registros[i].endereco.numero,
                      complemento:registros[i].endereco.complemento,
                      });
      }
      return retorno;
    } catch (error) {
      console.log(error);
      throw new Error(`Erro ao gerar dados de listagem ${error.message}`);
    }
  };  
 
  static async findOne(consulta) {
    return await VendedorModel.findOne(consulta);
  };  
};
