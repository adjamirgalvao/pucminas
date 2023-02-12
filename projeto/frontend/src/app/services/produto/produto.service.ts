import { CompraAgrupada } from 'src/app/interfaces/CompraAgrupada';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_PRODUTO + 'relatorios/listagem', {responseType: 'blob'});
  }  

  listarIndicador(id: string, ano: number): Observable<CompraAgrupada[]> {
    let queryParams = new HttpParams();
    
    queryParams = queryParams.append("ano", ano).append("agrupar", true);    
    return this.http.get<CompraAgrupada[]>(this.API_PRODUTO + '' + id + '/listarItensCompras', { params:queryParams });
  }  
}
