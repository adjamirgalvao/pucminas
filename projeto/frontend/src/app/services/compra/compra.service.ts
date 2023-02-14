import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PORTA_BACKEND } from 'src/app/constantes/Config';
import { Compra } from 'src/app/interfaces/Compra';

@Injectable({
  providedIn: 'root'
})
export class CompraService {


  private readonly API_COMPRA = 'http://localhost:' + PORTA_BACKEND + '/api/compras/';

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

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_COMPRA + 'relatorios/listagem', {responseType: 'blob'});
  }
}
