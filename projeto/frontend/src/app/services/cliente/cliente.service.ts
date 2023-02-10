import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/interfaces/Cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly API_CLIENTE = 'http://localhost:8090/api/clientes/';

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

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_CLIENTE + 'relatorios/listagem', {responseType: 'blob'});
  }
}