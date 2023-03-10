const FornecedorModel = require("../models/FornecedorModel");
const { CompraModel } = require("../models/CompraModel");
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
    let erro = false;
    try {

      const novo = {
        nome: data.nome.trim(),
        tipo: data.tipo.trim(),
        identificacao: data.identificacao,
        endereco: data.endereco
      };
      //https://stackoverflow.com/questions/33627238/mongoose-find-with-multiple-conditions
      console.log('expressao', RelatorioUtilService.escapeRegExp(novo.nome.trim()));
      let fornecedor = await FornecedorModel.findOne({ $or: [{ nome: { $regex: RelatorioUtilService.escapeRegExp(novo.nome.trim()), $options: 'i'}}, { identificacao: novo.identificacao.trim() }] });
      if (fornecedor) {
        erro = true;
        throw new Error('Fornecedor não pode ser criado pois já existe um fornecedor com mesmo nome ou cnpj/cpf.');
      }
      const registro = await new FornecedorModel(novo).save({ session });

      return registro;
    } catch (error) {
      if (erro) {
        throw new Error(error.message);
      } else {
        throw new Error(`Fornecedor não pode ser criado ${error.message}`);
      }  
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
    let erro = false;
    try {
      let fornecedores = await FornecedorModel.find({ $or: [{ nome: { $regex: RelatorioUtilService.escapeRegExp(fornecedor.nome.trim()), $options: 'i'} },  { identificacao: fornecedor.identificacao.trim() }] });
      if (fornecedores) {
        for (let i in fornecedores){
          if (fornecedores[i]._id != id) {
            erro = true;
            throw new Error('Fornecedor não pode ser alterado pois já existe um fornecedor com o mesmo nome ou cnpj/cpf.');
          }
        }
      }      
      const registro = await FornecedorModel.updateOne({ _id: id }, { ...fornecedor }, { session });

      return registro;
    } catch (error) {
      console.log(error);
      if (erro) {
        throw new Error(error.message);
      } else {
        throw new Error(`Fornecedor ${id} não pode ser atualizado ${error.message}`);
      }  
    }
  }

  static async deleteFornecedor(id, session) {
    try {
      let compra = await CompraModel.findOne({id_fornecedor : id});

      if (compra){
        throw new Error(`, pois possui compra.`);
      } else {        
        const registro = await FornecedorModel.findOneAndDelete({ _id: id }, { session });
        return registro;
      }
    } catch (error) {
      console.log(`Fornecedor não pode ser excluído ${error.message}`);
      throw new Error(`Fornecedor não pode ser excluído ${error.message}`);
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

  static async getExcelListagem() {
    try {
      let retorno = [];
      let registros = await this.getAllFornecedores();
      for (let i in registros){
        retorno.push({nome: registros[i].nome, 
                      tipo: getTipo(registros[i].tipo), 
                      cpf_cnpj: RelatorioUtilService.getMascaraCPFCNPJ(registros[i].identificacao),
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
}