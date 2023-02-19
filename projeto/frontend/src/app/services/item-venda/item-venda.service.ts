import { Cliente } from './../../interfaces/Cliente';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemVendaAgrupada } from 'src/app/interfaces/ItemVendaAgrupada';

@Injectable({
  providedIn: 'root'
})
export class ItemVendaService {

  private readonly API_ITEM_VENDA = '/api/itensVendas/';

  constructor(private http: HttpClient) { 

  }
  
  listarProdutosMaisVendidos(ano: number, cliente: Cliente) : Observable<ItemVendaAgrupada[]> {
    let queryParams = new HttpParams();
    
      queryParams = queryParams.append("ano", ano);   
      if (cliente){
        queryParams = queryParams.append("id_cliente", cliente._id!);
      } 
      return this.http.get<ItemVendaAgrupada[]>(this.API_ITEM_VENDA + 'consultas/produtosMaisVendidos', { params:queryParams });    
  }

}