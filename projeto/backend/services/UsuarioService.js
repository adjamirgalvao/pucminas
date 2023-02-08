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
    let erro = false;
    try {

      const novo = {
        nome: data.nome,
        login: data.login,
        email: data.email,
        senha: data.senha,
        roles: data.roles,
      };
      //https://stackoverflow.com/questions/33627238/mongoose-find-with-multiple-conditions
      let usuarios = await UsuarioModel.find({ $or: [{ login: novo.login }, { email: novo.email }] });
      if (usuarios.length > 0) {
        erro = true;
        throw new Error('Usuário não pode ser criado pois já existe um usuário com mesmo login ou email.');
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

  static async updateUsuario(id, usuario, session) {
    let erro = false;
    try {
      let usuarios = await UsuarioModel.find({ email: usuario.email });
      if ((usuarios.length > 0) && (usuarios[0]._id != usuario._id)) {
        erro = true;
        throw new Error('Usuário não pode ser alterado pois já existe um usuário com mesmo email.');
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
