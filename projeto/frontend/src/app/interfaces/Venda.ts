import { Vendedor } from 'src/app/interfaces/Vendedor';
import { ItemVenda } from 'src/app/interfaces/ItemVenda';

export interface Venda { 
    _id?: string
    data: Date
    numero?: string
    total?: number
    custoTotal?: number
    id_vendedor?: string
    vendedor?: Vendedor
    itensVenda?: ItemVenda[]
  }