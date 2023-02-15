import { Produto } from "./Produto"

export interface ItemVendaAgrupada {
  produto : Produto
  quantidade: number
  precoTotal: number
  descontoTotal: number
}