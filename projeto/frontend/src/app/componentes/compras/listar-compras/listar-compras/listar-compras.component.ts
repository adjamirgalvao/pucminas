import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { ModalConfirmacaoComponent } from 'src/app/componentes/util/modal-confirmacao/modal-confirmacao.component';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Compra } from 'src/app/interfaces/Compra';
import { CompraService } from 'src/app/services/compra/compra.service';

@Component({
  selector: 'app-listar-compras',
  templateUrl: './listar-compras.component.html',
  styleUrls: ['./listar-compras.component.css']
})
export class ListarComprasComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compraService: CompraService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  compras: Compra[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  compraExcluida!: Compra;

  // Campos para a tabela
  displayedColumns: string[] = ['nome', 'tipo', 'identificacao', 'actions'];
  dataSource: MatTableDataSource<Compra> = new MatTableDataSource();

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
    this.compraService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar compras!' });
        throw 'Erro ao recuperar compras! Detalhes: ' + err;
      })).subscribe(
        (compras) => {
          this.carregando = false;
          console.log(compras);
          this.compras = compras;
          this.dataSource.data = this.compras;
        });
  }

  confirmarExcluirCompra(compra: Compra) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão da compra '${compra.numero}'?`,
        titulo: 'Confirmação de Exclusão de Compra'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == 'Sim') {
        this.excluirCompra(compra);
      }
    });
  }

  excluirCompra(compra: Compra) {
    console.log('excluindo', compra);


    //Excluindo os dados 
    this.excluindo = true;
    this.compraExcluida = compra;
    this.compraService.excluir(compra).pipe(catchError(
      err => {
        this.excluindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir a compra "${compra.numero}"!` });
        throw 'Erro ao excluir a compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.compras.splice(this.compras.indexOf(compra), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.compras);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `A compra "${compra.numero}" foi excluído com sucesso!` });
        });
  }
}

