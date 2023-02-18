const { VendaModel, Mongoose } = require("../models/VendaModel");
const ItemVendaService = require("./ItemVendaService");
const RelatorioUtilService = require("./RelatorioUtilService");

// https://stackoverflow.com/questions/73195776/how-to-get-the-first-element-from-a-child-lookup-in-aggregation-mongoose
function allVendasVendedorInnerJoin(id_cliente, ano, agrupar) {
  let retorno = [];

  if (id_cliente){
    retorno = [...retorno,     
    // Para localizar por id tem que ser pelo tipo. Neste caso pode ser assim pq o id_cliente já vem como objeto mongoose.  
    {
      '$match': {
        'id_cliente': id_cliente
      }
    },];
  }
  retorno = [...retorno, 

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
        'from': 'clientes',
        'localField': 'id_cliente',
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
              'in': { "$multiply": ['$$itemvenda.precoCusto', '$$itemvenda.quantidade'] },
            }
          }
        }
      }
    },
  ];

  // https://stackoverflow.com/questions/70289720/aggregate-query-by-year-and-month-in-mongodb
  if (ano) {
    retorno = [...retorno,   {
        $match: {
                  data: { $gte: new Date(ano +"-01-01"), $lte: new Date(ano + "-12-31") }
              }      
      }];
  }
  if (agrupar) {
    retorno = [...retorno, 
        //https://stackoverflow.com/questions/27366209/group-and-count-by-month
        {$group: {
            _id: {$month: "$data"}, 
            custoTotal: {$sum: "$custoTotal"}, 
            vendasTotal: {$sum: "$total"}, 
          //https://stackoverflow.com/questions/16676170/is-it-possible-to-sum-2-fields-in-mongodb-using-the-aggregation-framework
           lucroTotal: {$sum: { $subtract : [ '$total', '$custoTotal' ]}}, 
           numeroVendas: {$sum: 1 }, 
        }
      },
      {
      $addFields: {
        ticketMedio: { $divide : [ '$vendasTotal', '$numeroVendas' ]}
      }  
    },
    //ordenação
    {$sort : { _id : 1 }}  ];
  }
  return retorno;
}

function umaVendaItensVendedorInnerJoinconst(id) {
  return [
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
  ]
};

function getVendedor(data, registro) {
  return registro.vendedor.nome;
}

function getLucro(data, registro) {
  let lucro = registro.total - registro.custoTotal;
  let cor = (lucro > 0 ? '' : 'text-danger');

  return `<span class='${cor}'>${RelatorioUtilService.getDinheiro(lucro)}</span>`;
}

function getRodape(registros) {
  let retorno = '';
  if (registros && registros.length > 0) {
    //https://reqbin.com/code/javascript/m81eb1ms/javascript-sum-array-example#:~:text=How%20to%20find%20the%20sum,removed%20or%20missing%20array%20elements.
    let sumTotal = registros.reduce(function (a, b) {
      return a.total + b.total;
    });
    let sumCustoTotal = registros.reduce(function (a, b) {
      return a.custoTotal + b.custoTotal;
    });
    let lucro = sumTotal - sumCustoTotal;
    let cor = (lucro > 0 ? '' : 'text-danger');

    retorno += '<tr>';
    retorno += `<th scope="row">Total</th>`;
    retorno += `<th scope="row"></th>`;
    retorno += `<th scope="row"></th>`;
    retorno += `<th scope="row"></th>`;
    retorno += `<th scope="row">${RelatorioUtilService.getDinheiro(sumTotal)}</th>`;
    retorno += `<th scope="row"><span class="${cor}">${RelatorioUtilService.getDinheiro(lucro)}</span></th>`;
    retorno += '</tr>';
  }
  return retorno;
}

module.exports = class VendaService {
  static async getAllVendas(id_cliente, ano, agrupar) {
    try {
      const todos = await VendaModel.aggregate(allVendasVendedorInnerJoin(id_cliente, ano, agrupar));

      return todos;
    } catch (error) {
      console.log(`Erro ao recuperar Vendas ${error.message}`);
      throw new Error(`Erro ao recuperar Vendas ${error.message}`);
    }
  }

  static async addVenda(data, sessionPassada) {
    const session = sessionPassada != null ? sessionPassada : await Mongoose.startSession();
    if (!sessionPassada) {
      session.startTransaction();
    }

    try {
      const novo = {
        data: data.data,
        id_vendedor: data.id_vendedor,
        id_cliente : data.id_cliente,
      };

      let registro = await new VendaModel(novo).save({ session });

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
        retorno = registro[0];
      }
    } catch (error) {
      console.log(`Venda ${id} não encontrada ${error.message}`);
      throw new Error(`Venda ${id} não encontrada ${error.message}`);
    }

    if (retorno) {
      return retorno;
    } else {
      throw new Error(`Venda ${id} não encontrada`);
    }
  }

  static async updateVenda(id, venda, session) {
    try {
      const registro = await VendaModel.updateOne({ _id: id }, { ...venda }, { session });

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

      const registro = await VendaModel.findOneAndDelete({ _id: id }, { session });

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

  static async getRelatorioListagem() {
    try {
      let registros = await this.getAllVendas();
      let html = RelatorioUtilService.gerarCabecalho('Listagem de Vendas');
      html += RelatorioUtilService.gerarTabela(registros, ['data', 'vendedor.nome', 'total', 'lucro'], ['Data', 'Vendedor', 'Valor', 'Lucro'], [RelatorioUtilService.getDataFormatada, null, getVendedor, RelatorioUtilService.getDinheiro, getLucro], getRodape);
      html += RelatorioUtilService.gerarFim();

      return html;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de listagem ${error.message}`);
    }
  };

  static async getExcelListagem() {
    try {
      let retorno = [];
      let registros = await this.getAllVendas();
      for (let i in registros){
        retorno.push({data: RelatorioUtilService.getDataFormatada(registros[i].data), 
                      vendedor: registros[i].vendedor.nome,
                      valor: registros[i].total,
                      lucro: registros[i].total - registros[i].custoTotal});
      }
      return retorno;
    } catch (error) {
      throw new Error(`Erro ao gerar dados de listagem ${error.message}`);
    }
  };    
};
