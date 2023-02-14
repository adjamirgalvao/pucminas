import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PORTA_BACKEND } from 'src/app/constantes/Config';
import { Fornecedor } from 'src/app/interfaces/Fornecedor';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {

  private readonly API_FORNECEDOR = 'http://localhost:' + PORTA_BACKEND + '/api/fornecedores/';

  constructor(private http: HttpClient) { 

  }

  listar(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(this.API_FORNECEDOR);
  }

  criar(fornecedor: Fornecedor): Observable<Fornecedor> {
    console.log(fornecedor);
    return this.http.post<Fornecedor>(this.API_FORNECEDOR, fornecedor);
  }

  buscarPorId(id: string): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(this.API_FORNECEDOR + '' + id);
  }

  editar(fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(this.API_FORNECEDOR + '' + fornecedor._id, fornecedor);
  }
 
  excluir(fornecedor: Fornecedor): Observable<Fornecedor> {
    console.log(fornecedor);
    return this.http.delete<Fornecedor>(this.API_FORNECEDOR + '' + fornecedor._id);
  }

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_FORNECEDOR + 'relatorios/listagem', {responseType: 'blob'});
  }
}
