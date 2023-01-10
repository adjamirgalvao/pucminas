import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Produto } from 'src/app/interfaces/Produto';
import { ProdutoService } from 'src/app/services/produto.service';

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar-produtos.component.html',
  styleUrls: ['./listar-produtos.component.css']
})
export class ListarProdutosComponent implements OnInit{
  constructor(private service: ProdutoService){
    
  }

  alertas: Alerta[] = [];
  produtos: Produto[] = [];
  carregando: boolean = true;
  excluindo: boolean = false;
  produtoExcluido: Produto = {
    _id: 0,
    nome: '',
    quantidade: 0,
    preco: 0
  };

  // Campos para a tabela
  displayedColumns: string[] =  ['_id', 'nome', 'quantidade', 'preco', 'actions'];
  dataSource: MatTableDataSource<Produto> = new MatTableDataSource();
  sort!: MatSort;

  //https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    //Recuperando os dados
    this.service.listar().pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar produtos!' });
        throw 'Erro ao cadastrar produto. Detalhes: ' + err;
      })).subscribe(
        (produtos) => {
          this.carregando = false;
          console.log(produtos);
          this.produtos = produtos;
          this.dataSource.data = this.produtos; 
        });
  }

  excluirProduto(produto: Produto) {
    console.log('excluindo', produto);


    //Excluindo os dados 
    this.excluindo = true;
    this.produtoExcluido = produto;
    this.service.excluir(produto).pipe(catchError(
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

