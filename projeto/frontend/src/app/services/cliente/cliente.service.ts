import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/interfaces/Cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly API_CLIENTE = 'http://localhost:8090/clientes/';

  constructor(private http: HttpClient) { 

  }

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.API_CLIENTE);
  }

  criar(cliente: Cliente): Observable<Cliente> {
    console.log(cliente);
    return this.http.post<Cliente>(this.API_CLIENTE, cliente);
  }

  buscarPorId(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(this.API_CLIENTE + '' + id);
  }

  editar(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(this.API_CLIENTE + '' + cliente._id, cliente);
  }
 
  excluir(cliente: Cliente): Observable<Cliente> {
    console.log(cliente);
    return this.http.delete<Cliente>(this.API_CLIENTE + '' + cliente._id);
  }

}