const UsuarioModel = require("../models/UsuarioModel");

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
    try {

      const novo =  {
        nome: data.nome,
        login: data.login,
        email: data.email,
        senha: data.senha,
        roles: data.roles
    };
    const registro = await new UsuarioModel(novo).save({session});

      return registro;
    } catch (error) {
      console.log(error);
      throw new Error(`Usuario não pode ser criado ${error.message}`);
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

  static async updateUsuario(id, usuario, session) {
    try {
      const registro = await UsuarioModel.updateOne({ _id: id} , {... usuario}, {session});

      return registro;
    } catch (error) {
      console.log(`Usuario ${id} não pode ser atualizado ${error.message}`);
      throw new Error(`Usuario ${id} não pode ser atualizado ${error.message}`);
    }
  }

  static async deleteUsuario(id, session) {
    try {
      const registro = await UsuarioModel.findOneAndDelete({ _id: id }, {session});

      return registro;
    } catch (error) {
      console.log(`Usuario ${id} não pode ser deletado ${error.message}`);
      throw new Error(`Usuario ${id} não pode ser deletado ${error.message}`);
    }
  }
};
