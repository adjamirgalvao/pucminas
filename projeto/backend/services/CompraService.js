const { CompraModel, Mongoose } = require("../models/CompraModel");
const ProdutoService = require("./ProdutoService");
const NotaFiscalService = require("./NotaFiscalCompraService");

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
  //nota fiscal
  {
    '$lookup': {
      'from': 'notasfiscaiscompras', 
      'localField': 'id_nota', 
      'foreignField': '_id', 
      'as': 'notaFiscal'
    }
  }, { // para fazer com que fique um campo e não uma lista
     '$addFields': {
        'notaFiscal': {
            '$arrayElemAt': [
                '$notaFiscal', 0
            ]
        }
    }
  }, { // para virar inner join e não left join
    '$match': {
      'notaFiscal': {
          '$exists': true
      }
    }
  }  
];

module.exports = class CompraService {

  static async criarCompra(data, session) {
    const novaCompra = {
      id_produto: data.id_produto,
      id_nota: data.id_nota,
      quantidade: data.quantidade,
      preco: data.preco
    };

    const response = await new CompraModel(novaCompra).save({session});

    return response;
  }

  static async atualizarPrecoCustoAposEntrada(produto, compra, session) {
    let quantidadeInicial = produto.quantidade;

    produto.quantidade = produto.quantidade + compra.quantidade;
    produto.precoCusto = ((quantidadeInicial * produto.precoCusto) + (compra.quantidade * (compra.preco / compra.quantidade))) / produto.quantidade;
    produto.precoCusto = Math.round(produto.precoCusto * 100) / 100; //arredondar em 2 digitos

    await ProdutoService.updateProduto(produto._id, produto, session);
  }

  static async atualizarPrecoCustoAposSaida(produto, saida, session) {
    let quantidadeInicial = produto.quantidade;

    produto.quantidade = produto.quantidade - saida.quantidade;
    if (produto.quantidade > 0) {
      produto.precoCusto = ((quantidadeInicial * produto.precoCusto) - (saida.quantidade * (saida.preco / saida.quantidade))) / produto.quantidade;
      produto.precoCusto = Math.round(produto.precoCusto * 100) / 100; //arredondar em 2 digitos
    } else {
      produto.precoCusto = produto.precoCustoInicial;
    } 
    await ProdutoService.updateProduto(produto._id, produto, session);
  }

  static async getAllCompras() {
    try {

      const allCompras = await CompraModel.aggregate(compraProdutoInnerJoin);
      
      return allCompras;
    } catch (error) {
      console.log(`Erro ao recuperar Compras ${error.message}`);
      throw new Error(`Erro ao recuperar Compras ${error.message}`);
    }
  }

  // session no mongoose https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js/
  static async addCompra(data) {
    const session = await Mongoose.startSession();
    
    session.startTransaction();
    try {
      // Se a compra não tem a nota fiscal. é uma compra feita sem criar a nota. Então vamos criar a nota
      if (!data.id_nota) {
         const dataNota = {data : data.dataNotaFiscal,
                      numero: data.numeroNotaFiscal};

        const nota = await NotaFiscalService.addNotaFiscalCompra(dataNota, session);
        data.id_nota = nota._id;
      }
      const compra = await CompraService.criarCompra(data, session);
      const produto = await ProdutoService.getProdutobyId(data.id_produto);

      if (produto != null) {
         await CompraService.atualizarPrecoCustoAposEntrada(produto, compra, session);
         await session.commitTransaction();
      } else {
         throw new Error(`Produto ${data.id_produto} não cadastrado`);
      }

      return compra;
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw new Error(`Compra não pode ser criada ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  static async getComprabyId(id) {
    try {
      const Compra = await CompraModel.findById(id);

      return Compra;
    } catch (error) {
      console.log(`Compra ${id} não encontrada ${error.message}`);
      throw new Error(`Compra ${id} não encontrada ${error.message}`);
    }
  }

  static async deleteCompra(id) {
    const session = await Mongoose.startSession();
    
    session.startTransaction();
    try {
      const compraRemovida = await CompraModel.findOneAndDelete({ _id: id }, {session});
      const produto = await ProdutoService.getProdutobyId(compraRemovida.id_produto);

      if (produto != null) {
         await CompraService.atualizarPrecoCustoAposSaida(produto, compraRemovida, session);
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
