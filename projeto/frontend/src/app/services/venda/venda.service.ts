import { VendaAgrupada } from './../../interfaces/VendaAgrupada';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venda } from 'src/app/interfaces/Venda';

@Injectable({
  providedIn: 'root'
})
export class VendaService {

  //https://angular.io/guide/build#configuring-commonjs-dependencies
  private readonly API_VENDA = '/api/vendas/';

  constructor(private http: HttpClient) { 

  }

  criar(venda: Venda): Observable<Venda> {
    return this.http.post<Venda>(this.API_VENDA, venda);
  }
  
  buscarPorId(id: string): Observable<Venda> {
    return this.http.get<Venda>(this.API_VENDA + '' + id);
  }

  listar(filtroCliente: boolean) : Observable<Venda[]> {
    if (filtroCliente){ 
      let queryParams = new HttpParams();
    
      queryParams = queryParams.append("filtroCliente", true);    
      return this.http.get<Venda[]>(this.API_VENDA, { params:queryParams });
    } else {
      return this.http.get<Venda[]>(this.API_VENDA);
    }
  }

  listarIndicador(ano: number) : Observable<VendaAgrupada[]> {
    let queryParams = new HttpParams();
    
    queryParams = queryParams.append("ano", ano).append("agrupar", true);

    return this.http.get<VendaAgrupada[]>(this.API_VENDA, { params:queryParams });
  }

  excluir(venda: Venda): Observable<Venda> {
    console.log(venda);
    return this.http.delete<Venda>(this.API_VENDA + '' + venda._id);
  }

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_VENDA + 'relatorios/listagem', {responseType: 'blob'});
  }  

  listarProdutosMaisVendidos(ano: any) {
    throw new Error('Method not implemented.');
  }

}