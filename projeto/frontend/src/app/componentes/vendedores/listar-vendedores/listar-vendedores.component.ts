import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Vendedor } from 'src/app/interfaces/Vendedor';
import { VendedorService } from 'src/app/services/vendedor/vendedor.service';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-listar-vendedores',
  templateUrl: './listar-vendedores.component.html',
  styleUrls: ['./listar-vendedores.component.css']
})
export class ListarVendedoresComponent implements OnInit {

  constructor(
    private router: Router,
    private vendedorService: VendedorService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  vendedores: Vendedor[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  imprimindo: boolean = false;
  vendedorExcluido!: Vendedor;

  // Campos para a tabela
  displayedColumns: string[] = ['nome', 'cpf', 'salario', 'actions'];
  dataSource: MatTableDataSource<Vendedor> = new MatTableDataSource();

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
    this.vendedorService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar vendedores! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar vendedores! Detalhes: ' + err.error?.error;
      })).subscribe(
        (vendedores) => {
          this.carregando = false;
          console.log(vendedores);
          this.vendedores = vendedores;
          this.dataSource.data = this.vendedores;
        });
  }

  confirmarExcluirVendedor(vendedor: Vendedor) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão do vendedor '${vendedor.nome}'?`,
        titulo: 'Confirmação de Exclusão de Vendedor'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == 'Sim') {
        this.excluirVendedor(vendedor);
      }
    });
  }

  excluirVendedor(vendedor: Vendedor) {
    console.log('excluindo', vendedor);


    //Excluindo os dados 
    this.excluindo = true;
    this.vendedorExcluido = vendedor;
    this.vendedorService.excluir(vendedor).pipe(catchError(
      err => {
        this.excluindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir o vendedor "${vendedor.nome}"! Detalhes: ${err.error?.error}` });
        throw 'Erro ao excluir o vendedor. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.vendedores.splice(this.vendedores.indexOf(vendedor), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.vendedores);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `O Vendedor "${vendedor.nome}" foi excluído com sucesso!` });
        });
  }

  abrirRelatorio(){
    this.imprimindo = true;
    this.vendedorService.getRelatorioListagem().pipe(catchError(
      err => {
        console.log(err);
        this.imprimindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar relatório` });
        throw 'Erro ao recuperar relatório. Detalhes: ' + err;
      })).subscribe(
        (data) => {
            // https://stackoverflow.com/questions/51509190/angular-6-responsecontenttype
            this.imprimindo = false;
            var file = new Blob([data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        });
  }  
}