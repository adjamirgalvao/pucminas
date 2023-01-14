import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCompraProduto } from '../../interfaces/ItemCompraProduto';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private readonly API_ITEM_COMPRA = 'http://localhost:8090/compras/';

  constructor(private http: HttpClient) { 

  }
  
  criarItemCompra(itemCompra: ItemCompraProduto): Observable<ItemCompraProduto> {
    return this.http.post<ItemCompraProduto>(this.API_ITEM_COMPRA, itemCompra);
  }

  listarItemCompra() : Observable<ItemCompraProduto> {
    return this.http.get<ItemCompraProduto>(this.API_ITEM_COMPRA);
  }

  excluirItemCompra(itemCompra: ItemCompraProduto): Observable<ItemCompraProduto> {
    console.log(itemCompra);
    return this.http.delete<ItemCompraProduto>(this.API_ITEM_COMPRA + '' + itemCompra._id);
  }
}
