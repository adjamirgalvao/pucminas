const { ItemVendaModel, Mongoose } = require("../models/ItemVendaModel");
const ProdutoService = require("./ProdutoService");

// https://stackoverflow.com/questions/73195776/how-to-get-the-first-element-from-a-child-lookup-in-aggregation-mongoose
const allItensVendaProdutoInnerJoin = [
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
  //venda
  {
    '$lookup': {
      'from': 'vendas', 
      'localField': 'id_venda', 
      'foreignField': '_id', 
      'as': 'venda'
    }
  }, { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'venda': {
            '$arrayElemAt': [
                '$venda', 0
            ]
        }
    }
  }, { // para virar inner join e não left join
    '$match': {
      'venda': {
          '$exists': true
      }
    }
  }  
];

module.exports = class ItemVendaService {

  static async criarItemVenda(data, session) {
    let produto = await ProdutoService.findById(data.id_produto);
    const itemVenda = {
      id_produto: data.id_produto,
      id_venda: data.id_venda,
      quantidade: data.quantidade,
      preco: data.preco,
      precoCusto: produto.precoCusto
    };

    const response = await new ItemVendaModel(itemVenda).save({session});

    return response;
  }

  static async getAllItensVendas() {
    try {

      const todos = await ItemVendaModel.aggregate(allItensVendaProdutoInnerJoin);
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar ItensVendas ${error.message}`);
      throw new Error(`Erro ao recuperar ItensVendas ${error.message}`);
    }
  }

  // session no mongoose https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js/
  static async addItemVenda(data, sessionPassada) {
    const session = sessionPassada != null ? sessionPassada : await Mongoose.startSession();

    if (!sessionPassada) {
      session.startTransaction();
    }
    try {
      const itemVenda = await ItemVendaService.criarItemVenda(data, session);
      const produto = await ProdutoService.getProdutobyId(data.id_produto);

      if (produto != null) {
         produto.quantidade = produto.quantidade - itemVenda.quantidade;
         if (produto.quantidade < 0){
          throw new Error(`Produto ${data.id_produto} sem estoque suficiente para a venda`); 
         }
         await ProdutoService.updateProduto(produto, session);
         if (!sessionPassada) {
            await session.commitTransaction();
         } 
      } else {
         throw new Error(`Produto ${data.id_produto} não cadastrado`);
      }
      return itemVenda;
    } catch (error) {
      if (!sessionPassada) {
        await session.abortTransaction();
      }  
      console.log(error);
      throw new Error(`Item Venda não pode ser criada ${error.message}`);
    } finally {
      if (!sessionPassada) {
         session.endSession();
      }  
    }
  }

  static async getItemVendabyId(id) {
    try {
      const registro = await ItemVendaModel.findById(id);

      return registro;
    } catch (error) {
      console.log(`Venda ${id} não encontrada ${error.message}`);
      throw new Error(`Venda ${id} não encontrada ${error.message}`);
    }
  }

  static async deleteItemVenda(id, sessionPassada) {
    const session = sessionPassada != null? sessionPassada : await Mongoose.startSession();
    if (!sessionPassada) {
      session.startTransaction();
    }
    try {
      const itemVendaRemovida = await ItemVendaModel.findOneAndDelete({ _id: id }, {session});
      const produto = await ProdutoService.getProdutobyId(itemVendaRemovida.id_produto);

      if (produto != null) {
        produto.quantidade = produto.quantidade + itemVenda.quantidade;
        await ProdutoService.updateProduto(produto, session);
      }
      if (!sessionPassada) {
        await session.commitTransaction();
      }

      return itemVendaRemovida;
    } catch (error) {
      if (!sessionPassada) {
         await session.abortTransaction();
      }
      console.log(`Venda ${id} não pode ser deletada ${error.message}`);
      throw new Error(`Venda ${id} não pode ser deletada ${error.message}`);
    } finally {
      if (!sessionPassada) {
        session.endSession();
      }  
    }
  }
};
