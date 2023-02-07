import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioService } from 'src/app/services/usuario/usuario.service';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.css']
})
export class ListarUsuariosComponent implements OnInit {

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  usuarios: Usuario[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  usuarioExcluido!: Usuario;

  // Campos para a tabela
  displayedColumns: string[] = ['nome', 'login', 'email', 'actions'];
  dataSource: MatTableDataSource<Usuario> = new MatTableDataSource();

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
    this.usuarioService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar usuários! Detalhes: ${err.error?.error}`});
        throw 'Erro ao recuperar usuários! Detalhes: ' + err.error?.error;
      })).subscribe(
        (usuarios) => {
          this.carregando = false;
          console.log(usuarios);
          this.usuarios = usuarios;
          this.dataSource.data = this.usuarios;
        });
  }

  confirmarExcluirUsuario(usuario: Usuario) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão do usuário '${usuario.nome}'?`,
        titulo: 'Confirmação de Exclusão de Usuário'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == 'Sim') {
        this.excluirUsuario(usuario);
      }
    });
  }

  excluirUsuario(usuario: Usuario) {
    console.log('excluindo', usuario);


    //Excluindo os dados 
    this.excluindo = true;
    this.usuarioExcluido = usuario;
    this.usuarioService.excluir(usuario).pipe(catchError(
      err => {
        this.excluindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir o usuário "${usuario.nome}"!` });
        throw 'Erro ao excluir o usuário. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.usuarios.splice(this.usuarios.indexOf(usuario), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.usuarios);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `O Usuário "${usuario.nome}" foi excluído com sucesso!` });
        });
  }
}