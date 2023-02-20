import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCompra } from '../../interfaces/ItemCompra';

@Injectable({
  providedIn: 'root'
})
export class ItemCompraService {

  private readonly API_ITEM_COMPRA = '/api/itensCompras/';

  constructor(private http: HttpClient) { 

  }

  excluirItemCompra(itemCompra: ItemCompra): Observable<ItemCompra> {
    console.log(itemCompra);
    return this.http.delete<ItemCompra>(this.API_ITEM_COMPRA + '' + itemCompra._id);
  }
}
