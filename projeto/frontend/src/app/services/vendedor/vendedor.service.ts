import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vendedor } from '../../interfaces/Vendedor';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {

  private readonly API_VENDEDOR = '/api/vendedores/';

  constructor(private http: HttpClient) { 

  }

  listar(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(this.API_VENDEDOR);
  }

  criar(vendedor: Vendedor): Observable<Vendedor> {
    console.log(vendedor);
    return this.http.post<Vendedor>(this.API_VENDEDOR, vendedor);
  }

  buscarPorId(id: string): Observable<Vendedor> {
    return this.http.get<Vendedor>(this.API_VENDEDOR + '' + id);
  }

  buscarPorEmail(email: string): Observable<Vendedor> {
    return this.http.get<Vendedor>(this.API_VENDEDOR + 'email/' + email);
  }  

  editar(vendedor: Vendedor): Observable<Vendedor> {
    return this.http.put<Vendedor>(this.API_VENDEDOR + '' + vendedor._id, vendedor);
  }
 
  excluir(vendedor: Vendedor): Observable<Vendedor> {
    console.log(vendedor);
    return this.http.delete<Vendedor>(this.API_VENDEDOR + '' + vendedor._id);
  }

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_VENDEDOR + 'relatorios/listagem', {responseType: 'blob'});
  }

  getExcelListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_VENDEDOR + 'exportar/listagem', {responseType: 'blob'});
  }   
}
