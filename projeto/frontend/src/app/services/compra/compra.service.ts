import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Compra } from 'src/app/interfaces/Compra';

@Injectable({
  providedIn: 'root'
})
export class CompraService {


  private readonly API_COMPRA = 'http://localhost:8090/api/compras/';

  constructor(private http: HttpClient) { 

  }

  criar(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>(this.API_COMPRA, compra);
  }
  
  buscarPorId(id: string): Observable<Compra> {
    return this.http.get<Compra>(this.API_COMPRA + '' + id);
  }

  listar() : Observable<Compra[]> {
    return this.http.get<Compra[]>(this.API_COMPRA);
  }

  excluir(compra: Compra): Observable<Compra> {
    console.log(compra);
    return this.http.delete<Compra>(this.API_COMPRA + '' + compra._id);
  }
}
