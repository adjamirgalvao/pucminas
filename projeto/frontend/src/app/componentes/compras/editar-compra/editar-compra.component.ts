import { Fornecedor } from 'src/app/interfaces/Fornecedor';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-editar-compra',
  templateUrl: './editar-compra.component.html',
  styleUrls: ['./editar-compra.component.css'],

})

export class EditarCompraComponent implements OnInit {
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
  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;


  // Campos para a tabela
  displayedColumns: string[] = ['produto.nome', 'quantidade', 'preco'];
  dataSource: MatTableDataSource<ItemCompra> = new MatTableDataSource();

  //Sem isso não consegui fazer funcionar o sort e paginator https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
  private paginator!: MatPaginator;
  private sort!: MatSort;

  //Filtro de produtos
  produtos: Produto[] = [];
  produtosFiltrados!: Observable<Produto[]>;
  
  //Filtro de fornecedores
  fornecedores: Fornecedor[] = [];
  fornecedoresFiltrados!: Observable<Fornecedor[]>;

  @ViewChild('produto') inputProduto!: ElementRef;
    
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild('inicio') inputInicio!: ElementRef;

  private setFocusInicial() {
    //Sem isso dá O erro ExpressionChangedAfterItHasBeenCheckedError 
    //Isso agendará a atualização da propriedade para a próxima iteração do ciclo de vida do Angular, permitindo que a detecção de alterações seja concluída antes que a propriedade seja atualizada.
    setTimeout(() => { this.inputInicio.nativeElement.focus(); }, 0);
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
    this.operacao = (id == null) ? 'Nova' : this.router.url.indexOf('editar') > 0 ? 'Editar' : 'Detalhar';

    if (this.operacao != 'Detalhar'){
      this.displayedColumns.push('acoes');
    } else {
      this.leitura = true;
    }

    this.criarFormulario();
    this.erroCarregando = false;
    this.carregando = true;
    this.produtoService.listar().pipe(catchError(
      err => {
        this.erroCarregando = true;
        this.carregando = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: 'Erro ao recuperar produtos!' });
        throw 'Erro ao recuperar produtos! Detalhes: ' + err;
      })).subscribe((produtos) => {
        this.produtos = produtos;
        this.ordernarNome(this.produtos);
        console.log(produtos);

        this.fornecedorService.listar().pipe(catchError(
          err => {
            this.erroCarregando = true;
            this.carregando = false;
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Erro ao recuperar fornecedores!' });
            throw 'Erro ao recuperar fornecedores! Detalhes: ' + err;
          })).subscribe((fornecedores) => {
            this.fornecedores = fornecedores;
            this.ordernarNome(this.fornecedores);
            console.log(fornecedores);

            if (this.operacao != 'Nova') {
              this.erroCarregando = false;
              this.carregando = true;
              this.compraService.buscarPorId(id!).pipe(catchError(
                (err: HttpErrorResponse)  => {
                  this.erroCarregando = true;
                  this.carregando = false;
                  if (err.status == 404) {
                    this.adicionarAlerta({ tipo: 'danger', mensagem: 'Compra não encontrada!' });
                    this.leitura = true;
                    this.criarFormulario();
                  } else {
                    this.adicionarAlerta({ tipo: 'danger', mensagem: 'Erro ao recuperar a compra!' });
                  }
                   throw 'Erro ao recuperar a compra! Detalhes: ' + err;
                })).subscribe((compra) => {
                  this.carregando = false;
                  if (compra != null) {
                    this.inicial = compra;
                    this.itensCompra = compra.itensCompra!;
                    this.criarFormulario();
                    this.atualizarTabela();
                    this.setFocusInicial();
                  } else {
                    this.adicionarAlerta({ tipo: 'danger', mensagem: 'Compra não encontrada!' });
                    this.erroCarregando = true;
                  }
                });
            } else {
              this.criarFormulario();
              this.carregando = false;
              this.setFocusInicial();
            }
          });
      });

  }

  salvar(): void {
    // Criação da compra
    let compra: Compra = {
      data: this.formulario.value.data,
      numero: this.formulario.value.numero,
      itensCompra: this.itensCompra
    };
    if (this.formulario.get('fornecedor')?.valid && (this.formulario.value.fornecedor)) {
      compra.id_fornecedor = this.formulario.value.fornecedor._id;
    }      

    this.salvandoFormulario(true);
    if (this.operacao == 'Nova') {
      this.cadastrarCompra(compra);
    } else {
      compra._id = this.inicial._id!;
      this.editarCompra(compra);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Nova') || this.listar) {
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
      //essa segunda condição deixa o fornecedor ser vazio
      if ((control.value !== undefined)  && (control.value != '') && !(typeof control.value != 'string')) {
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
      data: [{value: this.inicial.data, disabled: this.readOnly()}, Validators.compose([
        Validators.required
      ])],
      fornecedor: [{value: this.inicial.fornecedor, disabled: this.readOnly()}, this.fornecedorValidator()],
      numero: [{value: this.inicial.numero, disabled: this.readOnly()}],
      produto: [{value: '', disabled: this.readOnly()}, Validators.compose([
        Validators.required, this.produtoValidator()
      ])],
      quantidade: [{value: '', disabled: this.readOnly()}, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])],
      preco: [{value: 0, disabled: this.readOnly()}, Validators.compose([
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

    //Faz o filtro de fornecedores e garante que o valor do campo fornecedor é um objeto
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
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: 'Erro ao cadastrar compra!' });
        throw 'Erro ao cadastrar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = [];
          this.adicionarAlerta({ tipo: 'success', mensagem: `Compra cadastrada com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.inicial.data =  new Date();
          this.formDirective.resetForm(this.inicial);
          this.itensCompra = [];
          this.atualizarTabela();
          this.setFocusInicial();
        });
  }

  private editarCompra(compra: Compra) {
    this.compraService.editar(compra).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: 'Erro ao editar compra!' });
        throw 'Erro ao editar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/compras'],  {state: {alerta: {tipo: 'success', mensagem: `Compra salva com sucesso!`} }});
        });
  }  

  readOnly() {
    return this.salvando || this.erroCarregando || this.leitura;
  }

  adicionarItem() {
    const itemCompra: ItemCompra = {
      preco: this.formulario.value.preco,
      quantidade: this.formulario.value.quantidade,
      id_produto: this.formulario.value.produto._id,
      produto: this.formulario.value.produto
    };

    this.itensCompra.push(itemCompra);
    // resetando parte do formulario
    this.resetAdicionarProduto();
    this.alertas = [];
    this.adicionarAlerta({ tipo: 'success', mensagem: `Produto '${itemCompra.produto!.nome}' adicionado a compra.` })
    this.atualizarTabela();
  }

  private resetAdicionarProduto() {
    this.formulario.get('quantidade')?.setValue('');
    this.formulario.get('quantidade')?.markAsUntouched();

    this.formulario.get('preco')?.setValue(0);
    this.formulario.get('preco')?.markAsUntouched();

    this.formulario.get('produto')?.setValue('');
    this.formulario.get('produto')?.markAsUntouched();
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
        this.resetAdicionarProduto();
      }
    });
  }
  
  ordernarNome(objeto: { nome: string; }[]) {
    objeto.sort( (a: { nome: string; }, b: { nome: string; }) => {
      if ( a.nome < b.nome ){
        return -1;
      }
      if ( a.nome > b.nome ){
        return 1;
      }
      return 0;});
  }

  private salvandoFormulario(salvando: boolean){
    this.salvando = salvando;
    if (salvando) {
      this.formulario.disable();
    } else {
      this.formulario.enable();
    }
  }  
   
  public adicionarAlerta(alerta: any){
    if (!this.alertas.find(a => a.tipo === alerta.tipo && a.mensagem === alerta.mensagem)) {
      this.alertas.push(alerta);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

