import { AuthService } from './../../../services/autenticacao/auth/auth.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
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
export class ListarVendasComponent implements OnInit, OnDestroy{

  constructor(
    private deviceService: DeviceDetectorService,   
    public authService: AuthService,
    private router: Router,
    private vendaService: VendaService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.adicionarAlerta(alerta);
      }
      // https://stackoverflow.com/questions/45184969/get-current-url-in-angular
      if (this.router.url.indexOf('/meusPedidos') > -1) {
        this.operacao = 'Meus Pedidos';
        this.displayedColumns = [...this.displayedColumns, { def: 'total', showMobile: true}, { def: 'acoes', showMobile: true}];
      } else {
        this.displayedColumns = [...this.displayedColumns, { def: 'vendedor', showMobile: false}, { def: 'total', showMobile: true}];
        if (authService.isGestor()) {
          this.displayedColumns = [...this.displayedColumns, { def: 'lucro', showMobile: true}];
        }
        this.displayedColumns = [...this.displayedColumns,{ def: 'acoes', showMobile: true}];
      } 
  }

  handlerOrientation: any;
  
  ngOnDestroy(): void {
    console.log('on destroy');
    //https://stackoverflow.com/questions/46906763/how-to-remove-eventlisteners-in-angular-4
    //https://code.daypilot.org/79036/angular-calendar-detect-orientation-change-landscape-portrait
    this.landscape.removeEventListener("change", this.handlerOrientation, true);
  }

  private onChangeOrientation() {
    console.log('landscape orientation');
  }

  //https://code.daypilot.org/79036/angular-calendar-detect-orientation-change-landscape-portrait
  landscape = window.matchMedia("(orientation: landscape)");

  alertas: Alerta[] = [];
  vendas: Venda[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  imprimindo: boolean = false;
  exportando: boolean = false;
  vendaExcluida!: Venda;
  operacao = 'Listar Vendas';

  // Campos para a tabela
  displayedColumns = [{ def: 'data', showMobile: true}];
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

  isPortrait() {
    return !this.landscape.matches;
  }  
  
  //https://stackoverflow.com/questions/47077302/angular2-material-table-hide-column
  //https://stackoverflow.com/questions/41432533/how-to-detect-if-device-is-desktop-and-or-mobile-and-if-connection-is-wifi-or-n
  getDisplayedColumns() : string[] {
    let exibir = !this.isPortrait();
    return this.displayedColumns.filter(cd => exibir || cd.showMobile).map(cd => cd.def);
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // para ordernar subcampo
    // https://stackoverflow.com/questions/55030357/angular-matsort-not-working-when-using-object-inside-datasource
    // e aqui descobri que tinha que colocar o item: any https://technology.amis.nl/frontend/sorting-an-angular-material-table/
    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch (property) {
         case 'vendedor': return  item.vendedor?.nome;
         case 'lucro': return  item.total - item.custoTotal;
         default: return item[property];
      }
   }      
  }

  ngOnInit(): void {
    //https://code.daypilot.org/79036/angular-calendar-detect-orientation-change-landscape-portrait
    this.handlerOrientation = this.onChangeOrientation.bind(this);
    this.landscape.addEventListener("change", this.handlerOrientation, true);   
    //Recuperando os dados
    let filtroCliente = this.operacao != 'Listar Vendas';
    this.vendaService.listar(filtroCliente).pipe(catchError(
      err => {
        this.carregando = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar vendas! Detalhes: ${err.error?.error}` });
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
        mensagem: `Confirma a exclusão da venda ?`,
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
    //Excluindo os dados 
    this.excluindo = true;
    this.vendaExcluida = venda;
    this.vendaService.excluir(venda).pipe(catchError(
      err => {
        this.excluindo = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao excluir a venda! Detalhes: ${err.error?.error}` });
        throw 'Erro ao excluir a venda. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.vendas.splice(this.vendas.indexOf(venda), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.vendas);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.adicionarAlerta({ tipo: 'success', mensagem: `A venda foi excluída com sucesso!` });
        });
  }

  abrirExcel(){
    this.exportando = true;
    this.vendaService.getExcelListagem().pipe(catchError(
      err => {
        console.log(err);
        this.exportando = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar excel` });
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
           a.download = 'Vendas';
           a.click();
           window.URL.revokeObjectURL(url);
           a.remove();
        });
  } 

  abrirRelatorio(){
    this.imprimindo = true;
    this.vendaService.getRelatorioListagem().pipe(catchError(
      err => {
        console.log(err);
        this.imprimindo = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar relatório` });
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
           a.download = 'Vendas';
           a.click();
           window.URL.revokeObjectURL(url);
           a.remove();
        });
  }  
   
  public adicionarAlerta(alerta: any){
    if (!this.alertas.find(a => a.tipo === alerta.tipo && a.mensagem === alerta.mensagem)) {
      this.alertas.push(alerta);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

