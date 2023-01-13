import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotaFiscalCompra } from 'src/app/interfaces/NotaFiscalCompra';

@Injectable({
  providedIn: 'root'
})
export class NotaFiscalCompraService {


  private readonly API_NOTA = 'http://localhost:8090/notasFiscaisCompra/';

  constructor(private http: HttpClient) { 

  }

  criarNota(nota: NotaFiscalCompra): Observable<NotaFiscalCompra> {
    return this.http.post<NotaFiscalCompra>(this.API_NOTA, nota);
  }

  listar(id: string) : Observable<NotaFiscalCompra> {
    return this.http.get<NotaFiscalCompra>(this.API_NOTA);
  }

  excluir(nota: NotaFiscalCompra): Observable<NotaFiscalCompra> {
    console.log(nota);
    return this.http.delete<NotaFiscalCompra>(this.API_NOTA + '' + nota._id);
  }
}
