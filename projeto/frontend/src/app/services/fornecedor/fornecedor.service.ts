import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fornecedor } from 'src/app/interfaces/Fornecedor';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {

  private readonly API_FORNECEDOR = 'http://localhost:8090/fornecedores/';

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

}
