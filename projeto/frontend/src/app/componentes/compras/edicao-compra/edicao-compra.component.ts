import { Fornecedor } from 'src/app/interfaces/Fornecedor';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';

import { Alerta } from '../../../interfaces/Alerta';
import { CompraService } from 'src/app/services/compra/compra.service';
import { Compra } from 'src/app/interfaces/Compra';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';
import { MatDialog } from '@angular/material/dialog';
import { ProdutoService } from 'src/app/services/produto/produto.service';
import { Produto } from 'src/app/interfaces/Produto';
import { map, Observable, startWith } from 'rxjs';
import { FornecedorService } from 'src/app/services/fornecedor/fornecedor.service';

@Component({
  selector: 'app-edicao-compra',
  templateUrl: './edicao-compra.component.html',
  styleUrls: ['./edicao-compra.component.css'],

})

export class EdicaoCompraComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private compraService: CompraService,
    private produtoService: ProdutoService,
    private fornecedorService: FornecedorService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    public confirmacao: MatDialog) {
    // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
    // não pode ficar no OnInit 
    let modo = this.router.getCurrentNavigation()?.extras.state?.['operacao'];
    if (modo) {
      this.operacao = modo;
      this.leitura = true;
    }
  }

  formulario!: FormGroup;

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;
  leitura: boolean = false;

  inicial: Compra = {
    numero: '',
    data: new Date(),
  };

  itensCompra: ItemCompra[] = [];
  produtos: Produto[] = [];
  fornecedores: Fornecedor[] = [];
  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;


  // Campos para a tabela
  displayedColumns: string[] = ['produto.nome', 'quantidade', 'preco', 'actions'];
  dataSource: MatTableDataSource<ItemCompra> = new MatTableDataSource();

  //Sem isso não consegui fazer funcionar o sort e paginator https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
  private paginator!: MatPaginator;
  private sort!: MatSort;

  //Filtro de produtos
  produtosFiltrados!: Observable<Produto[]>;
  //Filtro de fornecedores
  fornecedoresFiltrados!: Observable<Fornecedor[]>;

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
        case 'produto.nome': return item.produto.nome;
        default: return item[property];
      }
    }
  }

  atualizarTabela(): void {
    //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
    this.dataSource = new MatTableDataSource(this.itensCompra);
    this.setDataSourceAttributes(); // para atualizar paginação
  }

  /** Quantidade total dos itens
  */
    getQuantidadeTotal() {
      return this.itensCompra.map(t => t.quantidade).reduce((acc, value) => acc + value, 0);
    }
  /** Preço total dos itens
  */
  getPrecoTotal() {
    return this.itensCompra.map(t => t.preco).reduce((acc, value) => acc + value, 0);
  }


  displayFnProduto(produto: Produto): string {
    return produto && produto.nome ? produto.nome : '';
  }

  private _filterProduto(nome: string): Produto[] {
    const filterValue = nome.toLowerCase();

    return this.produtos.filter(produto => produto.nome.toLowerCase().includes(filterValue));
  }

  displayFnFornecedor(fornecedor: Fornecedor): string {
    return fornecedor && fornecedor.nome ? fornecedor.nome : '';
  }

  private _filterFornecedor(nome: string): Fornecedor[] {
    const filterValue = nome.toLowerCase();

    return this.fornecedores.filter(fornecedor => fornecedor.nome.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    if (!this.operacao) {
      this.operacao = (id == null) ? 'Cadastrar' : 'Editar';
    }

    this.criarFormulario();
    this.erroCarregando = false;
    this.carregando = true;
    this.produtoService.listar().pipe(catchError(
      err => {
        this.erroCarregando = true;
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar produtos!' });
        throw 'Erro ao recuperar produtos! Detalhes: ' + err;
      })).subscribe((produtos) => {
        this.produtos = produtos;
        console.log(produtos);

        this.fornecedorService.listar().pipe(catchError(
          err => {
            this.erroCarregando = true;
            this.carregando = false;
            this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar fornecedores!' });
            throw 'Erro ao recuperar fornecedores! Detalhes: ' + err;
          })).subscribe((fornecedores) => {
            this.fornecedores = fornecedores;
            console.log(fornecedores);

            if (this.operacao != 'Cadastrar') {
              this.erroCarregando = false;
              this.carregando = true;
              this.compraService.buscarPorId(id!).pipe(catchError(
                err => {
                  this.erroCarregando = true;
                  this.carregando = false;
                  this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar a compra!' });
                  throw 'Erro ao recuperar a compra! Detalhes: ' + err;
                })).subscribe((compra) => {
                  this.carregando = false;
                  if (compra != null) {
                    this.inicial = compra;
                    console.log('inicial', this.inicial);
                    this.criarFormulario();
                  } else {
                    this.alertas.push({ tipo: 'danger', mensagem: 'Compra não encontrada!' });
                    this.erroCarregando = true;
                  }
                });
            } else {
              this.criarFormulario();
              this.carregando = false;
            }
          });
      });

  }

  salvar(): void {
    // Criação da compra
    const compra: Compra = {
      data: this.formulario.value.data,
      numero: this.formulario.value.numero
    };

    this.salvando = true;
    if (this.operacao == 'Cadastrar') {
      this.cadastrarCompra(compra);
    } else {
      compra._id = this.inicial._id!;
      this.editarCompra(compra);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Cadastrar') || this.listar) {
      this.router.navigate(['/compras']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }
  }

  formularioValido(): boolean {
    return this.formulario.get('data')!.valid && this.formulario.get('fornecedor')!.valid && this.formulario.get('numero')!.valid && this.itensCompra.length > 0;
  }

  formularioIncluirValido(): boolean {
    return this.formulario.get('produto')!.valid && this.formulario.get('quantidade')!.valid && this.formulario.get('preco')!.valid;
  }

  fornecedorValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if ((control.value !== undefined) && !(typeof control.value != 'string')) {
        return { 'fornecedorCadastrado': true };
      }
      return null;
    }
  }

  produtoValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if ((control.value !== undefined) && !(typeof control.value != 'string')) {
        return { 'produtoCadastrado': true };
      }
      return null;
    }
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    this.formulario = this.formBuilder.group({
      data: [this.inicial.data, Validators.compose([
        Validators.required
      ])],
      fornecedor: ['', Validators.compose([
        Validators.required, this.fornecedorValidator()
      ])],
      numero: [this.inicial.numero],
      produto: ['', Validators.compose([
        Validators.required, this.produtoValidator()
      ])],
      quantidade: [0, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])],
      preco: [0, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])]
    });

    //Faz o filtro de produtos e garante que o valor do campo produto é um objeto
    this.produtosFiltrados = this.formulario.controls['produto'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        if (ehString && nome && (nome != '') && this.produtos && (this.produtos.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          let produto = this.produtos.find(produto => produto.nome.toLowerCase() == nome.toLowerCase());
          if (produto) {
            this.formulario.get('produto')!.patchValue(produto, { emitEvent: false });
          }
        }
        return nome ? this._filterProduto(nome as string) : this.produtos.slice();
      }),
    );

    //Faz o filtro de produtos e garante que o valor do campo produto é um objeto
    this.fornecedoresFiltrados = this.formulario.controls['fornecedor'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        if (ehString && nome && (nome != '') && this.fornecedores && (this.fornecedores.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          let fornecedor = this.fornecedores.find(fornecedor => fornecedor.nome.toLowerCase() == nome.toLowerCase());
          if (fornecedor) {
            this.formulario.get('fornecedor')!.patchValue(fornecedor, { emitEvent: false });
          }
        }
        return nome ? this._filterFornecedor(nome as string) : this.fornecedores.slice();
      }),
    );
  }

  private cadastrarCompra(compra: Compra) {
    this.compraService.criar(compra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao cadastrar compra!' });
        throw 'Erro ao cadastrar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Compra "${compra.numero}" cadastrada com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
        });
  }

  readOnly() {
    return this.salvando || this.erroCarregando || this.leitura;
  }

  private editarCompra(compra: Compra) {
    /*
    this.salvando = true;
    this.service.editar(compra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao editar compra!' });
        throw 'Erro ao editar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/compras'],  {state: {alerta: {tipo: 'success', mensagem: `Compra "${compra.numero}" salva com sucesso!`} }});
        });
    */
  }


  adicionarItem() {
    const itemCompra: ItemCompra = {
      preco: this.formulario.value.preco,
      quantidade: this.formulario.value.quantidade,
      id_produto: this.formulario.value.produto._id,
      produto: this.formulario.value.produto
    };
    this.itensCompra.push(itemCompra);
    console.log('produto incluído', this.formulario.value.produto);

    // resetando parte do formulario
    let campos = ['quantidade', 'preco'];
    campos.map(campo => {
      this.formulario.get(campo)?.setValue(0);
      this.formulario.get(campo)?.markAsUntouched();
    });
    this.formulario.get('produto')?.setValue('');
    this.formulario.get('produto')?.markAsUntouched();

    this.atualizarTabela();
  }

  confirmarExcluirItemCompra(itemCompra: ItemCompra) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão da compra produto '${itemCompra.produto?.nome}'?`,
        titulo: 'Confirmação de Exclusão de Compra de Produto'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      if (result == 'Sim') {
        this.itensCompra.splice(this.itensCompra.indexOf(itemCompra), 1);
        this.atualizarTabela();
      }
    });
  }

}
