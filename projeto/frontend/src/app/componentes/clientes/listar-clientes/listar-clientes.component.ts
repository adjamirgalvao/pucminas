import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Cliente } from 'src/app/interfaces/Cliente';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-listar-clientes',
  templateUrl: './listar-clientes.component.html',
  styleUrls: ['./listar-clientes.component.css']
})
export class ListarClientesComponent  implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  clientes: Cliente[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  clienteExcluido!: Cliente;

  // Campos para a tabela
  displayedColumns: string[] = ['nome', 'cpf', 'dataNascimento', 'actions'];
  dataSource: MatTableDataSource<Cliente> = new MatTableDataSource();

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
    this.clienteService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar clientes!' });
        throw 'Erro ao recuperar clientes! Detalhes: ' + err;
      })).subscribe(
        (clientes) => {
          this.carregando = false;
          console.log(clientes);
          this.clientes = clientes;
          this.dataSource.data = this.clientes;
        });
  }

  confirmarExcluirCliente(cliente: Cliente) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão do cliente '${cliente.nome}'?`,
        titulo: 'Confirmação de Exclusão de Cliente'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == 'Sim') {
        this.excluirCliente(cliente);
      }
    });
  }

  excluirCliente(cliente: Cliente) {
    console.log('excluindo', cliente);


    //Excluindo os dados 
    this.excluindo = true;
    this.clienteExcluido = cliente;
    this.clienteService.excluir(cliente).pipe(catchError(
      err => {
        this.excluindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir o cliente "${cliente.nome}"!` });
        throw 'Erro ao excluir o cliente. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.clientes.splice(this.clientes.indexOf(cliente), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.clientes);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `O Cliente "${cliente.nome}" foi excluído com sucesso!` });
        });
  }
}

