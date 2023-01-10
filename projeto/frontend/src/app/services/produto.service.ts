import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../interfaces/Produto';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private readonly API = 'http://localhost:8090/produtos/'

  constructor(private http: HttpClient) { 

  }

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.API);
  }

  criar(produto: Produto): Observable<Produto> {
    console.log(produto);
    return this.http.post<Produto>(this.API, produto);
  }
 
  excluir(produto: Produto): Observable<Produto> {
    console.log(produto);
    return this.http.delete<Produto>(this.API + '' + produto._id);
  }
}
