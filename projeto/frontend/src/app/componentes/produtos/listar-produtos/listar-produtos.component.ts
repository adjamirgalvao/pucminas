import { ModalConfirmacaoComponent } from './../../util/modal-confirmacao/modal-confirmacao.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Produto } from 'src/app/interfaces/Produto';
import { ProdutoService } from 'src/app/services/produto/produto.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MyCustomPaginatorIntl } from '../../util/paginacao/MyCustomPaginatorIntl';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar-produtos.component.html',
  styleUrls: ['./listar-produtos.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }]
})
export class ListarProdutosComponent implements OnInit {

  constructor(
    private router: Router,
    private produtoService: ProdutoService,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  produtos: Produto[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  imprimindo: boolean = false;
  exportando: boolean = false;
  produtoExcluido!: Produto;

  // Campos para a tabela
  displayedColumns: string[] = ['nome', 'quantidade', 'preco', 'actions'];
  dataSource: MatTableDataSource<Produto> = new MatTableDataSource();

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
    this.produtoService.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar produtos! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar produtos! Detalhes: ' + err.error?.error;
      })).subscribe(
        (produtos) => {
          this.carregando = false;
          console.log(produtos);
          this.produtos = produtos;
          this.dataSource.data = this.produtos;
        });
  }

  confirmarExcluirProduto(produto: Produto) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão do produto '${produto.nome}'?`,
        titulo: 'Confirmação de Exclusão de Produto'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result == 'Sim') {
        this.excluirProduto(produto);
      }
    });
  }

  excluirProduto(produto: Produto) {
    console.log('excluindo', produto);


    //Excluindo os dados 
    this.excluindo = true;
    this.produtoExcluido = produto;
    this.produtoService.excluir(produto).pipe(catchError(
      err => {
        this.excluindo = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir o produto "${produto.nome}"! Detalhes: ${err.error?.error}` });
        throw 'Erro ao excluir o produto. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.produtos.splice(this.produtos.indexOf(produto), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.produtos);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `O Produto "${produto.nome}" foi excluído com sucesso!` });
        });
  }

  abrirExcel(){
    this.exportando = true;
    this.produtoService.getExcelListagem().pipe(catchError(
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
           a.download = 'Produtos';
           a.click();
           window.URL.revokeObjectURL(url);
           a.remove();
        });
  } 

  abrirRelatorio(){
    this.imprimindo = true;
    this.produtoService.getRelatorioListagem().pipe(catchError(
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
           a.download = 'Produtos';
           a.click();
           window.URL.revokeObjectURL(url);
           a.remove();
        });
  }  
}

