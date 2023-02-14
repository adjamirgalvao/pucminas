import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { ItemVendaAgrupada } from 'src/app/interfaces/ItemVendaAgrupada';
import { Produto } from 'src/app/interfaces/Produto';
import { ItemVendaService } from 'src/app/services/item-venda/item-venda.service';

@Component({
  selector: 'app-produtos-mais-vendidos',
  templateUrl: './produtos-mais-vendidos.component.html',
  styleUrls: ['./produtos-mais-vendidos.component.css']
})
export class ProdutosMaisVendidosComponent implements OnInit{
  constructor(
    private formBuilder: FormBuilder,
    private itemVendaService: ItemVendaService,
  ) {
  }

  carregando: boolean = false;
  carregado: boolean = false;
  alertas: Alerta[] = [];
  itemVendasAgrupadas: ItemVendaAgrupada[] = [];

  formulario!: FormGroup;
  
 // Campos para a tabela
 displayedColumns: string[] = ['nome', 'quantidade'];
 dataSource: MatTableDataSource<ItemVendaAgrupada> = new MatTableDataSource();

 //Sem isso não consegui fazer funcionar o sort e paginator https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
 private paginator!: MatPaginator;
 private sort!: MatSort;

 @ViewChild(MatSort) set matSort(ms: MatSort) {
   this.sort = ms;
   this.setDataSourceAttributes();
 }

 @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
   this.paginator = mp;
   this.setDataSourceAttributes();
 }

 setDataSourceAttributes() {
   this.dataSource.paginator = this.paginator;
   this.dataSource.sort = this.sort;
 }
 
 ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      ano: [new Date().getFullYear(), Validators.compose([
        Validators.required, Validators.min(1)
      ])],
    });
  }


  recuperarDados() {
    //Recuperando os dados
    this.carregando = true;
    this.carregado = false;
    this.itemVendaService.listarProdutosMaisVendidos(this.formulario.value.ano).pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar vendas! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar vendas! Detalhes: ' + err.error?.error;
      })).subscribe(
        (itemVendasAgrupadas) => {
          this.carregando = false;
          this.carregado = true;
          console.log(itemVendasAgrupadas);
          this.itemVendasAgrupadas = itemVendasAgrupadas;
          //this.dataSource.data = this.itemVendasAgrupadas;
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.itemVendasAgrupadas);
          this.setDataSourceAttributes(); // para atualizar paginação          
        });
  };
 
}
