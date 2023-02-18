import { Vendedor } from 'src/app/interfaces/Vendedor';
import { ItemVenda } from 'src/app/interfaces/ItemVenda';
import { Cliente } from './Cliente';

export interface Venda { 
    _id?: string
    data: Date
    total?: number
    custoTotal?: number
    id_vendedor?: string
    id_cliente?: string
    cliente?: Cliente
    vendedor?: Vendedor
    itensVenda?: ItemVenda[]
  }