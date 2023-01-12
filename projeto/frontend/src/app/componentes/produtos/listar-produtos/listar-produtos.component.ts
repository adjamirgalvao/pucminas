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

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar-produtos.component.html',
  styleUrls: ['./listar-produtos.component.css'],
  providers: [{provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl}]
})
export class ListarProdutosComponent implements OnInit{

  constructor(
    private produtoService: ProdutoService,
    public confirmacao: MatDialog){
  }

  alertas: Alerta[] = [];
  produtos: Produto[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  produtoExcluido!: Produto;

  // Campos para a tabela
  displayedColumns: string[] =  ['nome', 'quantidade', 'preco', 'precoCusto', 'actions'];
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
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar produtos!' });
        throw 'Erro ao recuperar compras! Detalhes: ' + err;
      })).subscribe(
        (produtos) => {
          this.carregando = false;
          console.log(produtos);
          this.produtos = produtos;
          this.dataSource.data = this.produtos; 
        });
  }

  confirmarExcluirProduto(produto: Produto){
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {mensagem: `Confirma a exclusão do produto '${produto.nome}'?`,
             titulo: 'Confirmação de Exclusão de Produto'},
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
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir o produto "${produto.nome}"!`});
        throw 'Erro ao excluir o produto. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.produtos.splice(this.produtos.indexOf(produto), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.produtos); 
          this.alertas.push({ tipo: 'success', mensagem: `O Produto "${produto.nome}" foi excluído com sucesso!` });
        });
  }
}

