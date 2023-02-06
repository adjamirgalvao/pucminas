import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Venda } from 'src/app/interfaces/Venda';
import { VendaService } from 'src/app/services/venda/venda.service';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-listar-vendas',
  templateUrl: './listar-vendas.component.html',
  styleUrls: ['./listar-vendas.component.css']
})
export class ListarVendasComponent implements OnInit {

  constructor(
    private router: Router,
    private vendaService: VendaService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  vendas: Venda[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  vendaExcluida!: Venda;

  // Campos para a tabela
  displayedColumns: string[] = ['data', 'numero', 'vendedor', 'total', 'lucro', 'actions'];
  dataSource: MatTableDataSource<Venda> = new MatTableDataSource();

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
    //Recuperando os dados
    this.vendaService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar vendas! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar vendas! Detalhes: ' + err.error?.error;
      })).subscribe(
        (vendas) => {
          this.carregando = false;
          console.log(vendas);
          this.vendas = vendas;
          this.dataSource.data = this.vendas;
        });
  }

  /** 
   * Lucro total das vendas
  */
  getLucroTotal() {
    return this.vendas.map(t => (t.total! - t.custoTotal!)).reduce((acc, value) => acc + value, 0);
  }

  /** 
   * Valor total das vendas
  */
   getValorTotal() {
      return this.vendas.map(t => t.total!).reduce((acc, value) => acc + value, 0);
    }


  confirmarExcluirVenda(venda: Venda) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão da venda '${venda.numero}'?`,
        titulo: 'Confirmação de Exclusão de Venda'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == 'Sim') {
        this.excluirVenda(venda);
      }
    });
  }

  excluirVenda(venda: Venda) {
    console.log('excluindo', venda);


    //Excluindo os dados 
    this.excluindo = true;
    this.vendaExcluida = venda;
    this.vendaService.excluir(venda).pipe(catchError(
      err => {
        this.excluindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir a venda "${venda.numero}"! Detalhes: ${err.error?.error}` });
        throw 'Erro ao excluir a venda. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.vendas.splice(this.vendas.indexOf(venda), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.vendas);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `A venda "${venda.numero}" foi excluída com sucesso!` });
        });
  }
}

