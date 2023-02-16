import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
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
    private deviceService: DeviceDetectorService,    
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
  imprimindo: boolean = false;
  exportando: boolean = false;
  compraExcluida!: Compra;

  // Campos para a tabela
  displayedColumns = [{ def: 'data', showMobile: true}, { def: 'numero', showMobile: false}, { def: 'fornecedor', showMobile: false}, { def: 'total', showMobile: true}, { def: 'actions', showMobile: true}];
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

  //https://stackoverflow.com/questions/47077302/angular2-material-table-hide-column
  //https://stackoverflow.com/questions/41432533/how-to-detect-if-device-is-desktop-and-or-mobile-and-if-connection-is-wifi-or-n
   getdisplayedColumns() : string[] {
      const isMobile = this.deviceService.isMobile();
      return this.displayedColumns
        .filter(cd => !isMobile || cd.showMobile)
        .map(cd => cd.def);
    }
   

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // para ordernar subcampo
    // https://stackoverflow.com/questions/55030357/angular-matsort-not-working-when-using-object-inside-datasource
    // e aqui descobri que tinha que colocar o item: any https://technology.amis.nl/frontend/sorting-an-angular-material-table/
    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch (property) {
         case 'fornecedor': return  item.fornecedor!.nome;
         default: return item[property];
      }
   }    
  }

  ngOnInit(): void {
    //Recuperando os dados
    this.compraService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar compras! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar compras! Detalhes: ' + err.error?.error;
      })).subscribe(
        (compras) => {
          this.carregando = false;
          console.log(compras);
          this.compras = compras;
          this.dataSource.data = this.compras;
        });
  }

  /** Preço total dos itens
  */
  getPrecoTotal() {
    return this.compras.map(t => t.total!).reduce((acc, value) => acc + value, 0);
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
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir a compra "${compra.numero}"! Detalhes: ${err.error?.error}` });
        throw 'Erro ao excluir a compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.compras.splice(this.compras.indexOf(compra), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.compras);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `A compra "${compra.numero}" foi excluída com sucesso!` });
        });
  }

  abrirExcel(){
    this.exportando = true;
    this.compraService.getExcelListagem().pipe(catchError(
      err => {
        console.log(err);
        this.exportando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar excel` });
        throw 'Erro ao recuperar excel. Detalhes: ' + err;
      })).subscribe(
        (data) => {
            // https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
            this.exportando = false;
           // var file = new Blob([data], {type: 'application/pdf'});
           // var fileURL = URL.createObjectURL(file);
           // window.open(fileURL);
           //https://medium.com/@danilodev.silva/download-de-pdf-com-angular-13-d2e2286ea966
           //https://stackoverflow.com/questions/58335807/how-to-download-an-excel-file-in-angular-8-as-an-api-response
           var file = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
           let url = window.URL.createObjectURL(file);
           let a = document.createElement('a');
           a.href = url;
           a.download = 'Compras';
           a.click();
           window.URL.revokeObjectURL(url);
           a.remove();
        });
  } 

  abrirRelatorio(){
    this.imprimindo = true;
    this.compraService.getRelatorioListagem().pipe(catchError(
      err => {
        console.log(err);
        this.imprimindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar relatório` });
        throw 'Erro ao recuperar relatório. Detalhes: ' + err;
      })).subscribe(
        (data) => {
            // https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
            this.imprimindo = false;
           // var file = new Blob([data], {type: 'application/pdf'});
           // var fileURL = URL.createObjectURL(file);
           // window.open(fileURL);
           //https://medium.com/@danilodev.silva/download-de-pdf-com-angular-13-d2e2286ea966
           let url = window.URL.createObjectURL(data);
           let a = document.createElement('a');
           a.href = url;
           a.download = 'Compras';
           a.click();
           window.URL.revokeObjectURL(url);
           a.remove();
        });
  }
}

