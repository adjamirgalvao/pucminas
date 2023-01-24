import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Compra } from 'src/app/interfaces/Compra';

@Injectable({
  providedIn: 'root'
})
export class CompraService {


  private readonly API_COMPRA = 'http://localhost:8090/compras/';

  constructor(private http: HttpClient) { 

  }

  criarCompra(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>(this.API_COMPRA, compra);
  }

  listar() : Observable<Compra[]> {
    return this.http.get<Compra[]>(this.API_COMPRA);
  }

  excluir(compra: Compra): Observable<Compra> {
    console.log(compra);
    return this.http.delete<Compra>(this.API_COMPRA + '' + compra._id);
  }
}
