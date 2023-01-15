import { Produto } from "./Produto"
import { Compra } from "./Compra"

export interface ItemCompra {
    _id?: string
    id_compra?: string
    id_produto: string 
    quantidade: number
    preco: number
    produto? : Produto
    compra? : Compra
    dataCompra?: string
    numeroCompra?: string
  }