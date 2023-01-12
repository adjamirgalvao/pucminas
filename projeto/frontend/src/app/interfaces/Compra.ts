import { Produto } from "./Produto"

export interface Compra {
    _id?: string
    id_produto: string 
    data: Date
    quantidade: number
    preco: number
    produto? : Produto[]
  }