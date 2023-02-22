const { CompraModel, Mongoose } = require("../models/CompraModel");
const ItemCompraService = require("../services/ItemCompraService");
const RelatorioUtilService = require("./RelatorioUtilService");

// https://stackoverflow.com/questions/73195776/how-to-get-the-first-element-from-a-child-lookup-in-aggregation-mongoose
const allComprasFornecedorInnerJoin = [
  {
    '$lookup': {
      'from': 'fornecedores', 
      'localField': 'id_fornecedor', 
      'foreignField': '_id', 
      'as': 'fornecedor'
    }
  },
  { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'fornecedor': {
            '$arrayElemAt': [
                '$fornecedor', 0
            ]
        }
    }
  },
  {
    '$lookup': {
      'from': 'itenscompras', 
      'localField': '_id', 
      'foreignField': 'id_compra', 
      'as': 'itensCompra'
    }  
  },
  //https://stackoverflow.com/questions/49491235/need-to-sum-from-array-object-value-in-mongodb
  {
    '$addFields': {
       'total': {
           '$sum': {
             '$map': {
               'input': "$itensCompra",
               'as': "itemcompra",
               'in': "$$itemcompra.preco",
             }
           }
         }
       }
  },
  
];

function umaCompraItensFornecedorInnerJoinconst (id) {
  return  [
  // Para localizar por id tem que ser pelo tipo
  {
    '$match': {
      '_id': Mongoose.Types.ObjectId(id)
    }
  },
  // lookup de fornecedores
  // https://stackoverflow.com/questions/73195776/how-to-get-the-first-element-from-a-child-lookup-in-aggregation-mongoose
  {
    '$lookup': {
      'from': 'fornecedores', 
      'localField': 'id_fornecedor', 
      'foreignField': '_id', 
      'as': 'fornecedor'
    }
  },
  { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'fornecedor': {
            '$arrayElemAt': [
                '$fornecedor', 0
            ]
        }
    }
  },
  {
    '$lookup': {
      'from': 'itenscompras', 
      'localField': '_id', 
      'foreignField': 'id_compra', 
      'as': 'itensCompra'
    }  
  },
  //Para fazer o lookup dentro de uma lista
  //https://stackoverflow.com/questions/72345162/mongodb-lookup-on-array-of-objects-with-reference-objectid
  //Cria uma tabela temporaria
  {
   '$lookup': {
      'from': 'produtos',
      'localField': 'itensCompra.id_produto',
      'foreignField': '_id',
      'as': 'todosProdutos'
    }
  },
  //agora vai refazer o itenscompra com o que tem $$this e o produto
  {
    "$set": {
      "itensCompra": {
        "$map": {
          "input": "$itensCompra",
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

function getFornecedor(data, registro){
  return registro.fornecedor.nome;
}

module.exports = class CompraService {
  static async getAllCompras() {
    try {
      const todos = await CompraModel.aggregate(allComprasFornecedorInnerJoin);
      
      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error.message}`);
      throw new Error(`Erro ao recuperar Compras ${error.message}`);
    }
  }

  static async addCompra(data, sessionPassada) {
    const session = sessionPassada != null? sessionPassada : await Mongoose.startSession();
    if (!sessionPassada) {
      session.startTransaction();
    }

    try {
      const novo = {
          data: data.data,
          numero: data.numero,
          id_fornecedor: data.id_fornecedor
       };

      let registro = await new CompraModel(novo).save({session});

      for (let i in data.itensCompra) {
          const novoItemCompra = {
             id_produto: data.itensCompra[i].id_produto,
             id_compra: registro._id,
             quantidade: data.itensCompra[i].quantidade,
             preco: data.itensCompra[i].preco
          };
          await ItemCompraService.addItemCompra(novoItemCompra, session);
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
      throw new Error(`Compra não pode ser criada ${error.message}`);
    } finally {
      if (!sessionPassada) {
         session.endSession();
      }  
    }
  }

  static async getComprabyId(id) {
    let retorno = null
    try {
      const registro = await CompraModel.aggregate(umaCompraItensFornecedorInnerJoinconst(id));

      if (registro && registro.length > 0) {
        retorno =  registro[0];
      }  
    } catch (error) {
      console.log(`Compra ${id} não encontrada ${error.message}`);
      throw new Error(`Compra ${id} não encontrada ${error.message}`);
    }

    if (retorno){
      return retorno;
    } else {
      throw new Error(`Compra ${id} não encontrada`);
    }
  }

  static async deleteCompra(id) {
    let session = await Mongoose.startSession();

    session.startTransaction();
    try {
      let compra = await this.getComprabyId(id);

      for (let i in compra.itensCompra) {
        await ItemCompraService.deleteItemCompra(compra.itensCompra[i]._id, session);
      }

      const registro = await CompraModel.findOneAndDelete({ _id: id }, {session});

      await session.commitTransaction();
      return registro;
    } catch (error) {
      await session.abortTransaction();
      console.log(`Compra ${id} não pode ser deletada ${error.message}`);
      throw new Error(`Compra ${id} não pode ser deletada ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  static async getRelatorioListagem() {
    try {
      let registros = await this.getAllCompras();
      let html = RelatorioUtilService.gerarCabecalho('Listagem de Compras');
      html += RelatorioUtilService.gerarTabela(registros, ['data', 'numero', 'fornecedor.nome', 'total'], ['Data', 'Nota Fiscal', 'Fornecedor', 'Preço'], [RelatorioUtilService.getDataFormatada, null, getFornecedor, RelatorioUtilService.getDinheiro]);
      html += RelatorioUtilService.gerarFim();

      return html;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de listagem ${error.message}`);
    }
  };  

  static async getExcelListagem() {
    try {
      let retorno = [];
      let registros = await this.getAllCompras();
      for (let i in registros){
        retorno.push({data: RelatorioUtilService.getDataFormatada(registros[i].data), 
                      notaFiscal: registros[i].numero, 
                      fornecedor: registros[i].fornecedor != null ? registros[i].fornecedor.nome : '',
                      preco: registros[i].total,
                      });
      }
      return retorno;
    } catch (error) {
      throw new Error(`Erro ao gerar dados de listagem ${error.message}`);
    }
  };    
};

