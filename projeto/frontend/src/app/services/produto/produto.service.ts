import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../../interfaces/Produto';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {


  private readonly API_PRODUTO = 'http://localhost:8090/api/produtos/';

  constructor(private http: HttpClient) { 

  }

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.API_PRODUTO);
  }

  listarComSaldo(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.API_PRODUTO + "?saldo=true");
  }

  criar(produto: Produto): Observable<Produto> {
    console.log(produto);
    return this.http.post<Produto>(this.API_PRODUTO, produto);
  }

  buscarPorId(id: string): Observable<Produto> {
    return this.http.get<Produto>(this.API_PRODUTO + '' + id);
  }

  editar(produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(this.API_PRODUTO + '' + produto._id, produto);
  }
 
  excluir(produto: Produto): Observable<Produto> {
    console.log(produto);
    return this.http.delete<Produto>(this.API_PRODUTO + '' + produto._id);
  }

  listarItensCompras(id: string): Observable<ItemCompra[]> {
    return this.http.get<ItemCompra[]>(this.API_PRODUTO + '' + id + '/listarItensCompras');
  }
}
