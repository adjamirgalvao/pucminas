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
import { ItemCompraService } from 'src/app/services/itemCompra/item-compra.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';
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
    private itemCompraService: ItemCompraService,
    private route: ActivatedRoute,
    private router: Router, 
    public confirmacao: MatDialog,
  ) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.alertas.push(alerta);
      }
  }

  alertas: Alerta[] = [];
  itensCompras: ItemCompra[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;

  itemCompraExcluida!: ItemCompra;
  //Esse declaro os valores porque o campo é exibido no formulário
  produto: Produto = {
    nome: '',
    quantidade: 0,
    preco: 0,
    precoCusto: 0
  };

  // Campos para a tabela
  displayedColumns: string[] = ['compra.data', 'quantidade', 'preco', 'actions'];
  dataSource: MatTableDataSource<ItemCompra> = new MatTableDataSource();

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

    // para ordernar subcampo
    // https://stackoverflow.com/questions/55030357/angular-matsort-not-working-when-using-object-inside-datasource
    // e aqui descobri que tinha que colocar o item: any https://technology.amis.nl/frontend/sorting-an-angular-material-table/
    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch (property) {
         case 'compra.data': return  item.compra!.data;
         default: return item[property];
      }
   }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.produtoService.buscarPorId(id!).pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar o produto!' });
        throw 'Erro ao recuperar o produto! Detalhes: ' + err.err;
      })).subscribe((produto) => {
      if (produto != null) {
        this.produto = produto;

        //Recuperando os dados
        this.produtoService.listarItensCompras(id!).pipe(catchError(
          err => {
            this.carregando = false;
            this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar compras!' });
            throw 'Erro ao recuperar compras! Detalhes: ' + err;
          })).subscribe(
            (itensCompras) => {
              this.carregando = false;
              console.log(itensCompras);
              this.itensCompras = itensCompras;
              this.dataSource.data = this.itensCompras;
            });
      } else {
        this.alertas.push({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
        this.carregando = false;
      }
    });
  }

  confirmarExcluirItemCompra(itemCompra: ItemCompra) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão da compra produto '${this.produto.nome}'?`,
        titulo: 'Confirmação de Exclusão de Compra de Produto'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      if (result == 'Sim') {
        this.excluirItemCompra(itemCompra);
      }
    });
  }

  excluirItemCompra(itemCompra: ItemCompra) {
    //Excluindo os dados 
    this.excluindo = true;
    this.itemCompraExcluida = itemCompra;
    this.itemCompraService.excluirItemCompra(itemCompra).pipe(catchError(
      err => {
        this.excluindo = false;
        console.log(err);
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao excluir a compra do produto "${this.produto.nome}"! Detalhes: ${err.error.error}` });
        throw `Erro ao excluir a compra do produto "${this.produto.nome}". Detalhes: ` + err;
      })).subscribe(
        () => {
          this.excluindo = false;
          this.itensCompras.splice(this.itensCompras.indexOf(itemCompra), 1);
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.itensCompras);
          this.setDataSourceAttributes(); // para atualizar paginação
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `A compra do Produto "${this.produto.nome}" foi excluída com sucesso!` });
        });
  }
}


