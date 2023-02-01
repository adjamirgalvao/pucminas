import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venda } from 'src/app/interfaces/Venda';

@Injectable({
  providedIn: 'root'
})
export class VendaService {


  private readonly API_COMPRA = 'http://localhost:8090/api/vendas/';

  constructor(private http: HttpClient) { 

  }

  criar(venda: Venda): Observable<Venda> {
    return this.http.post<Venda>(this.API_COMPRA, venda);
  }
  
  buscarPorId(id: string): Observable<Venda> {
    return this.http.get<Venda>(this.API_COMPRA + '' + id);
  }

  listar() : Observable<Venda[]> {
    return this.http.get<Venda[]>(this.API_COMPRA);
  }

  excluir(venda: Venda): Observable<Venda> {
    console.log(venda);
    return this.http.delete<Venda>(this.API_COMPRA + '' + venda._id);
  }
}