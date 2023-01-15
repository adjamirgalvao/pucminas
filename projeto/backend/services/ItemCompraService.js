const { ItemCompraModel, Mongoose } = require("../models/ItemCompraModel");
const ProdutoService = require("./ProdutoService");
const CompraService = require("./CompraService");

// https://stackoverflow.com/questions/73195776/how-to-get-the-first-element-from-a-child-lookup-in-aggregation-mongoose
const compraProdutoInnerJoin = [
  {
    '$lookup': {
      'from': 'produtos', 
      'localField': 'id_produto', 
      'foreignField': '_id', 
      'as': 'produto'
    }
  }, { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'produto': {
            '$arrayElemAt': [
                '$produto', 0
            ]
        }
    }
  }, { // para virar inner join e não left join
    '$match': {
      'produto': {
          '$exists': true
      }
    }
  },
  //compra
  {
    '$lookup': {
      'from': 'compras', 
      'localField': 'id_compra', 
      'foreignField': '_id', 
      'as': 'compra'
    }
  }, { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'compra': {
            '$arrayElemAt': [
                '$compra', 0
            ]
        }
    }
  }, { // para virar inner join e não left join
    '$match': {
      'compra': {
          '$exists': true
      }
    }
  }  
];

module.exports = class ItemCompraService {

  static async criarItemCompra(data, session) {
    const itemCompra = {
      id_produto: data.id_produto,
      id_compra: data.id_compra,
      quantidade: data.quantidade,
      preco: data.preco
    };

    const response = await new ItemCompraModel(itemCompra).save({session});

    return response;
  }

  static async getAllItensCompras() {
    try {

      const allItensCompras = await ItemCompraModel.aggregate(compraProdutoInnerJoin);
      
      return allItensCompras;
    } catch (error) {
      console.log(`Erro ao recuperar ItensCompras ${error.message}`);
      throw new Error(`Erro ao recuperar ItensCompras ${error.message}`);
    }
  }

  // session no mongoose https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js/
  static async addItemCompra(data) {
    const session = await Mongoose.startSession();
    
    session.startTransaction();
    try {
      // Se o teim não tem a compra. é uma compra feita sem criar a compra. Então vamos criar a compra
      if (!data.id_compra) {
         const dataCompra = {data : data.dataCompra,
                      numero: data.numeroCompra};

        const compra = await CompraService.addCompra(dataCompra, session);
        data.id_compra = compra._id;
      }
      const itemCompra = await ItemCompraService.criarItemCompra(data, session);
      const produto = await ProdutoService.getProdutobyId(data.id_produto);

      if (produto != null) {
         await ProdutoService.atualizarPrecoCustoAposEntrada(produto, itemCompra, session);
         await session.commitTransaction();
      } else {
         throw new Error(`Produto ${data.id_produto} não cadastrado`);
      }

      return itemCompra;
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw new Error(`Compra não pode ser criada ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  static async getItemComprabyId(id) {
    try {
      const Compra = await ItemCompraModel.findById(id);

      return Compra;
    } catch (error) {
      console.log(`Compra ${id} não encontrada ${error.message}`);
      throw new Error(`Compra ${id} não encontrada ${error.message}`);
    }
  }

  static async deleteItemCompra(id) {
    const session = await Mongoose.startSession();
    
    session.startTransaction();
    try {
      const compraRemovida = await ItemCompraModel.findOneAndDelete({ _id: id }, {session});
      const produto = await ProdutoService.getProdutobyId(compraRemovida.id_produto);

      if (produto != null) {
         await ProdutoService.atualizarPrecoCustoAposSaida(produto, compraRemovida, session);
      }
      await session.commitTransaction();

      return compraRemovida;
    } catch (error) {
      await session.abortTransaction();
      console.log(`Compra ${id} não pode ser deletada ${error.message}`);
      throw new Error(`Compra ${id} não pode ser deletada ${error.message}`);
    } finally {
      session.endSession();
    }
  }
};
