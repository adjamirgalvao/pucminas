import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Fornecedor } from 'src/app/interfaces/Fornecedor';
import { FornecedorService } from 'src/app/services/fornecedor/fornecedor.service';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-listar-fornecedores',
  templateUrl: './listar-fornecedores.component.html',
  styleUrls: ['./listar-fornecedores.component.css']
})
export class ListarFornecedoresComponent implements OnInit, OnDestroy {

  constructor(
    private deviceService: DeviceDetectorService,   
    private router: Router,
    private fornecedorService: FornecedorService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.adicionarAlerta(alerta);
      }
  }

  alertas: Alerta[] = [];
  fornecedores: Fornecedor[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  imprimindo: boolean = false;
  exportando: boolean = false;
  fornecedorExcluido!: Fornecedor;

  // Campos para a tabela
  displayedColumns = [{ def: 'nome', showMobile: true} , { def: 'tipo', showMobile: false}, { def: 'identificacao', showMobile: true}, { def: 'acoes', showMobile: true}];
  dataSource: MatTableDataSource<Fornecedor> = new MatTableDataSource();

  //Sem isso não consegui fazer funcionar o sort e paginator https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
  private paginator!: MatPaginator;
  private sort!: MatSort;

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
  }

  ngOnInit(): void {
    //https://code.daypilot.org/79036/angular-calendar-detect-orientation-change-landscape-portrait
    this.handlerOrientation = this.onChangeOrientation.bind(this);
    this.landscape.addEventListener("change", this.handlerOrientation, true);   
    //Recuperando os dados
    this.fornecedorService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar fornecedores! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar fornecedores! Detalhes: ' + err.error?.error;
      })).subscribe(
        (fornecedores) => {
          this.carregando = false;
          console.log(fornecedores);
          this.fornecedores = fornecedores;
          this.dataSource.data = this.fornecedores;
        });
  }

  confirmarExcluirFornecedor(fornecedor: Fornecedor) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão do fornecedor '${fornecedor.nome}'?`,
        titulo: 'Confirmação de Exclusão de Fornecedor'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == 'Sim') {
        this.excluirFornecedor(fornecedor);
      }
    });
  }

  excluirFornecedor(fornecedor: Fornecedor) {
    console.log('excluindo', fornecedor);


    //Excluindo os dados 
    this.excluindo = true;
    this.fornecedorExcluido = fornecedor;
    this.fornecedorService.excluir(fornecedor).pipe(catchError(
      err => {
        this.excluindo = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao excluir o fornecedor "${fornecedor.nome}"! Detalhes: ${err.error?.error}` });
        throw 'Erro ao excluir o fornecedor. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.fornecedores.splice(this.fornecedores.indexOf(fornecedor), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.fornecedores);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.adicionarAlerta({ tipo: 'success', mensagem: `O Fornecedor "${fornecedor.nome}" foi excluído com sucesso!` });
        });
  }

  abrirExcel(){
    this.exportando = true;
    this.fornecedorService.getExcelListagem().pipe(catchError(
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
           a.download = 'Fornecedores';
           a.click();
           window.URL.revokeObjectURL(url);
           a.remove();
        });
  } 

  abrirRelatorio(){
    this.imprimindo = true;
    this.fornecedorService.getRelatorioListagem().pipe(catchError(
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
           a.download = 'Fornecedores';
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
