import { Produto } from "./Produto"
import { Venda } from "./Venda"

export interface ItemVenda {
    _id?: string
    id_venda?: string
    id_produto: string 
    quantidade: number
    preco: number
    precoCusto?: number
    produto? : Produto
    venda? : Venda
  }