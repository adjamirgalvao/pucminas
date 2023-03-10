import { VendaAgrupada } from './../../interfaces/VendaAgrupada';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venda } from 'src/app/interfaces/Venda';
import { Cliente } from 'src/app/interfaces/Cliente';
import { ItemVendaAgrupada } from 'src/app/interfaces/ItemVendaAgrupada';

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

  editar(venda: Venda): Observable<Venda> {
    return this.http.put<Venda>(this.API_VENDA + '' + venda._id, venda);
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

  listarIndicador(ano: number, id_vendedor: string) : Observable<VendaAgrupada[]> {
    let queryParams = new HttpParams();
    
    queryParams = queryParams.append("ano", ano);
    if (id_vendedor){
      queryParams = queryParams.append("id_vendedor", id_vendedor);
    }

    return this.http.get<VendaAgrupada[]>(this.API_VENDA + 'consultas/indicadoresVendas', { params:queryParams });
  }

  excluir(venda: Venda): Observable<Venda> {
    console.log(venda);
    return this.http.delete<Venda>(this.API_VENDA + '' + venda._id);
  }

  getRelatorioListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_VENDA + 'relatorios/listagem', {responseType: 'blob'});
  }  

  getExcelListagem(): Observable<any> {
    //https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
    return this.http.get(this.API_VENDA + 'exportar/listagem', {responseType: 'blob'});
  }   

  listarProdutosMaisVendidos(ano: number, cliente: Cliente) : Observable<ItemVendaAgrupada[]> {
    let queryParams = new HttpParams();
    
      queryParams = queryParams.append("ano", ano);   
      if (cliente){
        queryParams = queryParams.append("id_cliente", cliente._id!);
      } 
      return this.http.get<ItemVendaAgrupada[]>(this.API_VENDA + 'consultas/produtosMaisVendidos', { params:queryParams });    
  }


}