const UsuarioModel = require("../models/UsuarioModel");
const { AutorizacaoService } = require("../services/AutorizacaoService");

module.exports = class UsuarioService {

  static async getAllUsuarios() {
    try {
      const todos = await UsuarioModel.find();

      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Usuarios ${error.message}`);
      throw new Error(`Erro ao recuperar Usuarios ${error.message}`);
    }
  }

  static async addUsuario(data, session) {
    let erro = false;
    try {

      if (!data.nome || !data.login || !data.email || !data.senha || !data.roles){
        erro = true;
        throw new Error('Usuário não pode ser criado pois já faltam informações (nome, login, email, senha ou roles).');
      }
      const novo = {
        nome: data.nome,
        login: data.login,
        email: data.email,
        senha: AutorizacaoService.criptografar(data.senha),
        roles: data.roles,
      };
      //https://stackoverflow.com/questions/33627238/mongoose-find-with-multiple-conditions
      let usuario = await UsuarioModel.findOne({ $or: [{ login: novo.login.trim() }, { email: novo.email.trim() }] });
      if (usuario) {
        erro = true;
        throw new Error('Usuário não pode ser criado pois já existe um usuário com mesmo login ou e-mail.');
      }
      const registro = await new UsuarioModel(novo).save({ session });

      return registro;
    } catch (error) {
      console.log(error);
      if (erro) {
        throw new Error(error.message);
      } else {
        throw new Error(`Usuario não pode ser criado ${error.message}`);
      }
    }
  }

  static async getUsuariobyId(usuarioId) {
    try {
      const registro = await UsuarioModel.findById(usuarioId);

      return registro;
    } catch (error) {
      console.log(`Usuario ${usuarioId} não encontrado ${error.message}`);
      throw new Error(`Usuario ${usuarioId} não encontrado ${error.message}`);
    }
  }

  static async find(consulta) {
    return await UsuarioModel.find(consulta);
  }

  static async findOne(consulta) {
    return await UsuarioModel.findOne(consulta);
  }

  static async updateUsuario(id, usuario, session) {
    let erro = false;
    try {
      let usuarioAntigo = await UsuarioModel.findOne({ email: usuario.email.trim() });
      if (usuarioAntigo && (usuarioAntigo._id != id)) {
        erro = true;
        throw new Error('Usuário não pode ser alterado pois já existe um usuário com mesmo e-mail.');
      }
      const registro = await UsuarioModel.updateOne({ _id: id }, { ...usuario }, { session });

      return registro;
    } catch (error) {
      console.log(`Usuario ${id} não pode ser atualizado ${error.message}`);
      if (erro) {
        throw new Error(error.message);
      } else {
        throw new Error(`Usuario ${id} não pode ser atualizado ${error.message}`);
      }
    }
  }

  static async deleteUsuario(id, session) {
    try {
      const registro = await UsuarioModel.findOneAndDelete({ _id: id }, { session });

      return registro;
    } catch (error) {
      console.log(`Usuario ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Usuario ${id} não pode ser deletado ${error.message}`);
    }
  }
};
