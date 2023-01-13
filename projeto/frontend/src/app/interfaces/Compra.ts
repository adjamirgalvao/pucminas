import { Produto } from "./Produto"
import { NotaFiscalCompra } from "./NotaFiscalCompra"

export interface Compra {
    _id?: string
    id_nota?: string
    id_produto: string 
    quantidade: number
    preco: number
    produto? : Produto
    notaFiscal? : NotaFiscalCompra
  }