import { Fornecedor } from 'src/app/interfaces/Fornecedor';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';

export interface Compra { 
    _id?: string
    data: Date
    numero?: string
    total?: number
    id_fornecedor?: string
    fornecedor?: Fornecedor
    itens?: ItemCompra[]
  }