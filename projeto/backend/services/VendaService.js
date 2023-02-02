const { VendaModel, Mongoose } = require("../models/VendaModel");
const ItemVendaService = require("./ItemVendaService");

// https://stackoverflow.com/questions/73195776/how-to-get-the-first-element-from-a-child-lookup-in-aggregation-mongoose
const allVendasVendedorInnerJoin = [
  {
    '$lookup': {
      'from': 'vendedores', 
      'localField': 'id_vendedor', 
      'foreignField': '_id', 
      'as': 'vendedor'
    }
  },
  { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'vendedor': {
            '$arrayElemAt': [
                '$vendedor', 0
            ]
        }
    }
  },
  {
    '$lookup': {
      'from': 'itensvendas', 
      'localField': '_id', 
      'foreignField': 'id_venda', 
      'as': 'itensVenda'
    }  
  },
  //https://stackoverflow.com/questions/49491235/need-to-sum-from-array-object-value-in-mongodb
  {
    '$addFields': {
       'total': {
           '$sum': {
             '$map': {
               'input': "$itensVenda",
               'as': "itemvenda",
               'in': "$$itemvenda.preco",
             }
           }
         }
       }
  },
  {
    '$addFields': {
       'custoTotal': {
           '$sum': {
             '$map': {
               'input': "$itensVenda",
               'as': "itemvenda",
               'in': {"$multiply" : ['$$itemvenda.precoCusto', '$$itemvenda.quantidade']},
             }
           }
         }
       }
  },  
];

function umaVendaItensVendedorInnerJoinconst (id) {
  return  [
  // Para localizar por id tem que ser pelo tipo
  {
    '$match': {
      '_id': Mongoose.Types.ObjectId(id)
    }
  },
  // lookup de vendedores
  // https://stackoverflow.com/questions/73195776/how-to-get-the-first-element-from-a-child-lookup-in-aggregation-mongoose
  {
    '$lookup': {
      'from': 'vendedores', 
      'localField': 'id_vendedor', 
      'foreignField': '_id', 
      'as': 'vendedor'
    }
  },
  { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'vendedor': {
            '$arrayElemAt': [
                '$vendedor', 0
            ]
        }
    }
  },
  {
    '$lookup': {
      'from': 'itensvendas', 
      'localField': '_id', 
      'foreignField': 'id_venda', 
      'as': 'itensVenda'
    }  
  },
  //Para fazer o lookup dentro de uma lista
  //https://stackoverflow.com/questions/72345162/mongodb-lookup-on-array-of-objects-with-reference-objectid
  //Cria uma tabela temporaria
  {
   '$lookup': {
      'from': 'produtos',
      'localField': 'itensVenda.id_produto',
      'foreignField': '_id',
      'as': 'todosProdutos'
    }
  },
  //agora vai refazer o itensvenda com o que tem $$this e o produto
  {
    "$set": {
      "itensVenda": {
        "$map": {
          "input": "$itensVenda",
          "in": {
            "$mergeObjects": [
              "$$this",
              {
                'produto': {
                  "$arrayElemAt": [
                    "$todosProdutos",
                    {
                      "$indexOfArray": [
                        "$todosProdutos._id",
                        "$$this.id_produto"
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  },
  //Remove a tabela temporaria
  {
    "$unset": [
      "todosProdutos"
    ]
  },
]};

module.exports = class VendaService {
  static async getAllVendas() {
    try {
      const todos = await VendaModel.aggregate(allVendasVendedorInnerJoin);
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Vendas ${error.message}`);
      throw new Error(`Erro ao recuperar Vendas ${error.message}`);
    }
  }

  static async addVenda(data, sessionPassada) {
    const session = sessionPassada != null? sessionPassada : await Mongoose.startSession();
    if (!sessionPassada) {
      session.startTransaction();
    }

    try {
      const novo = {
          data: data.data,
          numero: data.numero,
          id_vendedor: data.id_vendedor
       };

      let registro = await new VendaModel(novo).save({session});

      for (let i in data.itensVenda) {
          const novoItemVenda = {
             id_produto: data.itensVenda[i].id_produto,
             id_venda: registro._id,
             quantidade: data.itensVenda[i].quantidade,
             preco: data.itensVenda[i].preco,
             desconto: data.itensVenda[i].desconto,
             precoCusto: data.itensVenda[i].precoCusto,
             precoUnitario: data.itensVenda[i].precoUnitario,
          };
          await ItemVendaService.addItemVenda(novoItemVenda, session);
      }
      if (!sessionPassada) {
        await session.commitTransaction();
      } 
      return registro;
    } catch (error) {
      if (!sessionPassada) {
        await session.abortTransaction();
      }  
      console.log(error);
      throw new Error(`Venda não pode ser criada ${error.message}`);
    } finally {
      if (!sessionPassada) {
         session.endSession();
      }  
    }
  }

  static async getVendabyId(id) {
    let retorno = null
    try {
      const registro = await VendaModel.aggregate(umaVendaItensVendedorInnerJoinconst(id));

      if (registro && registro.length > 0) {
        retorno =  registro[0];
      }  
    } catch (error) {
      console.log(`Venda ${id} não encontrada ${error.message}`);
      throw new Error(`Venda ${id} não encontrada ${error.message}`);
    }

    if (retorno){
      return retorno;
    } else {
      throw new Error(`Venda ${id} não encontrada`);
    }
  }

  static async updateVenda(id, venda, session) {
    try {
      const registro = await VendaModel.updateOne({ _id: id} , {...venda}, {session});
    
      return registro;
    } catch (error) {
      console.log(`Venda ${id} não pode ser atualizada ${error.message}`);
      throw new Error(`Venda ${id} não pode ser atualizada ${error.message}`);
    }
  }

  static async deleteVenda(id) {
    let session = await Mongoose.startSession();

    session.startTransaction();
    try {
      let venda = await this.getVendabyId(id);

      for (let i in venda.itensVenda) {
        await ItemVendaService.deleteItemVenda(venda.itensVenda[i]._id, session);
      }

      const registro = await VendaModel.findOneAndDelete({ _id: id }, {session});

      await session.commitTransaction();
      return registro;
    } catch (error) {
      await session.abortTransaction();
      console.log(`Venda ${id} não pode ser deletada ${error.message}`);
      throw new Error(`Venda ${id} não pode ser deletada ${error.message}`);
    } finally {
      session.endSession();
    }
    
  }
};
