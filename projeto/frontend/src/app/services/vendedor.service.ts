import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vendedor } from '../interfaces/Vendedor';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {

  private readonly API_CLIENTE = 'http://localhost:8090/api/vendedores/';

  constructor(private http: HttpClient) { 

  }

  listar(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(this.API_CLIENTE);
  }

  criar(vendedor: Vendedor): Observable<Vendedor> {
    console.log(vendedor);
    return this.http.post<Vendedor>(this.API_CLIENTE, vendedor);
  }

  buscarPorId(id: string): Observable<Vendedor> {
    return this.http.get<Vendedor>(this.API_CLIENTE + '' + id);
  }

  editar(vendedor: Vendedor): Observable<Vendedor> {
    return this.http.put<Vendedor>(this.API_CLIENTE + '' + vendedor._id, vendedor);
  }
 
  excluir(vendedor: Vendedor): Observable<Vendedor> {
    console.log(vendedor);
    return this.http.delete<Vendedor>(this.API_CLIENTE + '' + vendedor._id);
  }

}
