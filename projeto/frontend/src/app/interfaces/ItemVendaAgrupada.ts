import { Produto } from "./Produto"

export interface ItemVendaAgrupada {
  produto : Produto
  quantidade: number
  precoFinalTotal: number
  precoTotal: number
  descontoTotal: number
}