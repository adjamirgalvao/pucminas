import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Compra } from 'src/app/interfaces/Compra';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private readonly API_COMPRA = '/api/compras/';

  constructor(private http: HttpClient) { 

  }

  criar(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>(this.API_COMPRA, compra);
  }
  
  editar(compra: Compra): Observable<Compra> {
    return this.http.put<Compra>(this.API_COMPRA + '' + compra._id, compra);
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
  
  excluirItemCompra(itemCompra: ItemCompra): Observable<ItemCompra> {
    console.log(itemCompra);
    return this.http.delete<ItemCompra>(this.API_COMPRA + itemCompra.id_compra +'/itensCompra/' + itemCompra._id);
  }  

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_COMPRA + 'relatorios/listagem', {responseType: 'blob'});
  }

  getExcelListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_COMPRA + 'exportar/listagem', {responseType: 'blob'});
  } 

}
