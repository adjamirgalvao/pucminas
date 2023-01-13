import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Produto } from 'src/app/interfaces/Produto';
import { ProdutoService } from 'src/app/services/produto/produto.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MyCustomPaginatorIntl } from '../../../util/paginacao/MyCustomPaginatorIntl';
import { CompraService } from 'src/app/services/compra/compra.service';
import { ActivatedRoute } from '@angular/router';
import { Compra } from 'src/app/interfaces/Compra';
import { ModalConfirmacaoComponent } from 'src/app/componentes/util/modal-confirmacao/modal-confirmacao.component';

@Component({
  selector: 'app-listar-compras-produto',
  templateUrl: './listar-compras-produto.component.html',
  styleUrls: ['./listar-compras-produto.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }]
})
export class ListarComprasProdutoComponent implements OnInit {


  constructor(
    private produtoService: ProdutoService,
    private compraService: CompraService,
    private route: ActivatedRoute,
    public confirmacao: MatDialog,
  ) {
  }

  alertas: Alerta[] = [];
  compras: Compra[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;

  compraExcluida!: Compra;
  //Esse declaro os valores porque o campo é exibido no formulário
  produto: Produto = {
    nome: '',
    quantidade: 0,
    preco: 0,
    precoCusto: 0
  };

  // Campos para a tabela
  displayedColumns: string[] = ['data', 'quantidade', 'preco', 'actions'];
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
    const id = this.route.snapshot.paramMap.get('id');

    this.produtoService.buscarPorId(id!).subscribe((produto) => {
      if (produto != null) {
        this.produto = produto;

        //Recuperando os dados
        this.produtoService.listarCompras(id!).pipe(catchError(
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
      } else {
        this.alertas.push({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
        this.carregando = false;
      }
    });
  }

  confirmarExcluirCompra(compra: Compra) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão da compra produto '${this.produto.nome}'?`,
        titulo: 'Confirmação de Exclusão de Compra de Produto'
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
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir a compra do produto "${this.produto.nome}"!` });
        throw `Erro ao excluir a compra do produto "${this.produto.nome}". Detalhes: ` + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.compras.splice(this.compras.indexOf(compra), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.compras);
          this.alertas.push({ tipo: 'success', mensagem: `A compra do Produto "${this.produto.nome}" foi excluída com sucesso!` });
        });
  }
}


