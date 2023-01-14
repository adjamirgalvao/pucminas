import { Produto } from "./Produto"
import { NotaFiscalCompra } from "./NotaFiscalCompra"

export interface ItemCompraProduto {
    _id?: string
    id_compra?: string
    id_produto: string 
    quantidade: number
    preco: number
    produto? : Produto
    compra? : NotaFiscalCompra
    dataCompra?: string
    numeroCompra?: string
  }