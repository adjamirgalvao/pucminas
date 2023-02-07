import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
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
export class ListarFornecedoresComponent implements OnInit {

  constructor(
    private router: Router,
    private fornecedorService: FornecedorService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  fornecedores: Fornecedor[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  fornecedorExcluido!: Fornecedor;

  // Campos para a tabela
  displayedColumns: string[] = ['nome', 'tipo', 'identificacao', 'actions'];
  dataSource: MatTableDataSource<Fornecedor> = new MatTableDataSource();

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
    this.fornecedorService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar fornecedores! Detalhes: ${err.error?.error}` });
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
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir o fornecedor "${fornecedor.nome}"!` });
        throw 'Erro ao excluir o fornecedor. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.fornecedores.splice(this.fornecedores.indexOf(fornecedor), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.fornecedores);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `O Fornecedor "${fornecedor.nome}" foi excluído com sucesso!` });
        });
  }
}
