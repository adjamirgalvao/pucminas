import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../../interfaces/Compra';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private readonly API_ITEM_COMPRA = 'http://localhost:8090/compras/';

  constructor(private http: HttpClient) { 

  }
  
  criarItemCompra(itemCompra: Compra): Observable<Compra> {
    return this.http.post<Compra>(this.API_ITEM_COMPRA, itemCompra);
  }

  listarItemCompra() : Observable<Compra> {
    return this.http.get<Compra>(this.API_ITEM_COMPRA);
  }

  excluirItemCompra(itemCompra: Compra): Observable<Compra> {
    console.log(itemCompra);
    return this.http.delete<Compra>(this.API_ITEM_COMPRA + '' + itemCompra._id);
  }
}
