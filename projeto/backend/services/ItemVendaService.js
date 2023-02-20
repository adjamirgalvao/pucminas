const { ItemVendaModel, Mongoose } = require("../models/ItemVendaModel");
const ProdutoService = require("./ProdutoService");

function getMaisVendidos(ano, id_cliente) {
  retorno = [
    //venda
    {
      '$lookup': {
        'from': 'vendas',
        'localField': 'id_venda',
        'foreignField': '_id',
        'as': 'venda'
      }
    },
    { // para fazer com que fique um campo e não uma lista
      '$addFields': {
        'venda': {
          '$arrayElemAt': [
            '$venda', 0
          ]
        }
      }
    },
    { // para virar inner join e não left join
      '$match': {
        'venda': {
          '$exists': true
        }
      }
    },
    {
      $match: {
        'venda.data': { $gte: new Date(ano + "-01-01"), $lte: new Date(ano + "-12-31") }
      }
    },
  ];

  if (id_cliente) {
    retorno = [...retorno, 
      //cliente
      {
        '$lookup': {
          'from': 'clientes',
          'localField': 'venda.id_cliente',
          'foreignField': '_id',
          'as': 'cliente'
        }
      },
      { // para fazer com que fique um campo e não uma lista
        '$addFields': {
          'cliente': {
            '$arrayElemAt': [
              '$cliente', 0
            ]
          }
        }
      },
      {
        '$match': {
          'cliente._id': new Mongoose.Types.ObjectId(id_cliente)
        }
      },
    ]
  }

  retorno = [...retorno,
  {
    $group: {
      _id: "$id_produto",
      precoTotal: { $sum: "$preco" },
      quantidade: { $sum: "$quantidade" },
      descontoTotal: { $sum: "$desconto" },
    }
  },
  // tive que fazer esse arredondamento porque 0.7 - 0.3 estava dando 0.3999999999999997
  {
    $addFields: {
      precoTotal: { $round: ['$precoTotal', 2] }
    }
  },
  {
    '$lookup': {
      'from': 'produtos',
      'localField': '_id',
      'foreignField': '_id',
      'as': 'produto'
    }
  },
  { // para fazer com que fique um campo e não uma lista
    '$addFields': {
      'produto': {
        '$arrayElemAt': [
          '$produto', 0
        ]
      }
    }
  },
  { // para virar inner join e não left join
    '$match': {
      'produto': {
        '$exists': true
      }
    }
  },
  //ordenação
  { $sort: { _id: -1 } }
  ];

  return retorno;
}

module.exports = class ItemVendaService {

  static async criarItemVenda(data, session) {
    const itemVenda = {
      id_produto: data.id_produto,
      id_venda: data.id_venda,
      quantidade: data.quantidade,
      preco: data.preco,
      desconto: data.desconto,
      precoCusto: data.precoCusto,
      precoUnitario: data.precoUnitario
    };

    const response = await new ItemVendaModel(itemVenda).save({ session });

    return response;
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
        console.log('produto', produto);
        produto.quantidade = produto.quantidade - itemVenda.quantidade;
        if (produto.quantidade < 0) {
          throw new Error(`Produto ${data.id_produto} sem estoque suficiente para a venda`);
        }
        //sem isso dá problema na comparação do id
        await ProdutoService.updateProduto(produto._id + '', produto, session);
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

  static async deleteItemVenda(id, sessionPassada) {
    const session = sessionPassada != null ? sessionPassada : await Mongoose.startSession();
    if (!sessionPassada) {
      session.startTransaction();
    }
    try {
      const itemVendaRemovida = await ItemVendaModel.findOneAndDelete({ _id: id }, { session });
      const produto = await ProdutoService.getProdutobyId(itemVendaRemovida.id_produto);

      if (produto != null) {
        produto.quantidade = produto.quantidade + itemVendaRemovida.quantidade;
        //sem isso dá problema na comparação do id 
        await ProdutoService.updateProduto(produto._id + '', produto, session);
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

  static async getProdutosMaisVendidos(ano, id_cliente) {
    try {

      const todos = await ItemVendaModel.aggregate(getMaisVendidos(ano, id_cliente));

      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar ItensVendas ${error.message}`);
      throw new Error(`Erro ao recuperar ItensVendas ${error.message}`);
    }
  }
};


