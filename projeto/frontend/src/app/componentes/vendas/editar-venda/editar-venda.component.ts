import { AuthService } from './../../../services/autenticacao/auth/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, catchError, startWith, map } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { ItemVenda } from 'src/app/interfaces/ItemVenda';
import { Produto } from 'src/app/interfaces/Produto';
import { Venda } from 'src/app/interfaces/Venda';
import { Vendedor } from 'src/app/interfaces/Vendedor';
import { ProdutoService } from 'src/app/services/produto/produto.service';
import { VendaService } from 'src/app/services/venda/venda.service';
import { VendedorService } from 'src/app/services/vendedor/vendedor.service';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-editar-venda',
  templateUrl: './editar-venda.component.html',
  styleUrls: ['./editar-venda.component.css']
})
export class EditarVendaComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private vendaService: VendaService,
    private produtoService: ProdutoService,
    private vendedorService: VendedorService,
    private authService: AuthService,
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

  inicial: Venda = {
    numero: '',
    data: new Date(),
  };

  itensVenda: ItemVenda[] = [];
  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;


  // Campos para a tabela
  displayedColumns: string[] = ['produto.nome', 'quantidade', 'precoUnitario', 'precoTotal', 'desconto', 'precoFinal'];
  dataSource: MatTableDataSource<ItemVenda> = new MatTableDataSource();

  //Sem isso não consegui fazer funcionar o sort e paginator https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
  private paginator!: MatPaginator;
  private sort!: MatSort;

  //Filtro de produtos
  produtos: Produto[] = [];
  produtosFiltrados!: Observable<Produto[]>;
  
  //Filtro de vendedores
  vendedores: Vendedor[] = [];
  vendedoresFiltrados!: Observable<Vendedor[]>;

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
    this.dataSource = new MatTableDataSource(this.itensVenda);
    this.setDataSourceAttributes(); // para atualizar paginação
  }

  /** Quantidade total dos itens
  */
  getQuantidadeTotal() {
      return this.itensVenda.map(t => t.quantidade).reduce((acc, value) => acc + value, 0);
  }
    
  /** Desconto total dos itens
  */
  getDescontoTotal() {
    return this.itensVenda.map(t => t.desconto).reduce((acc, value) => acc + value, 0);
}
  /** 
   * Preço total dos itens
  */
  getPrecoTotal() {
    return this.itensVenda.map(t => (t.quantidade * t.precoUnitario)).reduce((acc, value) => acc + value, 0);
  }

 /** Preço total dos itens
  */
 getPrecoFinalTotal() {
  return this.itensVenda.map(t => t.preco).reduce((acc, value) => acc + value, 0);
 }

  getPrecoUnitario_(): number {
    return this.getPrecoUnitario(this.formulario.value.produto);
  }

  getPrecoUnitario(produto: { preco: number; } | undefined): number {
    let retorno = 0;

    if (produto){
      retorno = produto.preco;
    }
    return retorno;  
  }
    
  getPrecoItemVenda_(): number {
    return this.getPrecoItemVenda(this.formulario.value.produto);
  }

  getPrecoFinalItemVenda_(): number {
    return this.getPrecoItemVenda(this.formulario.value.produto) - this.formulario.value.desconto;
  }

  getPrecoItemVenda(produto: { preco: number;} | undefined): number {
    let retorno = 0;
    
    if ((produto) && (this.formulario.value.quantidade)) {
      retorno = this.formulario.value.quantidade * this.getPrecoUnitario(produto);
    }

    return retorno;  
  }   

  displayFnProduto(produto: Produto): string {
    return produto && produto.nome ? produto.nome : '';
  }

  private _filterProduto(nome: string): Produto[] {
    const filterValue = nome.toLowerCase();

    return this.produtos.filter(produto => produto.nome.toLowerCase().includes(filterValue));
  }

  displayFnVendedor(vendedor: Vendedor): string {
    return vendedor && vendedor.nome ? vendedor.nome : '';
  }

  private _filterVendedor(nome: string): Vendedor[] {
    const filterValue = nome.toLowerCase();

    return this.vendedores.filter(vendedor => vendedor.nome.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    this.operacao = (id == null) ? 'Cadastrar' : 'Consultar'; //se fizer edição troca por Editar

    if (this.operacao != 'Consultar'){
      this.displayedColumns.push('actions');
    } else {
      this.leitura = true;
    }
    if ((this.operacao == 'Cadastrar') && this.authService.isLogado() && this.authService.isVendedor()){
      this.vendedorService.buscarPorEmail(this.authService.getUsuario().email!).pipe(catchError(
        err => {
          //this.erroCarregando = true;
          this.carregando = false;
          if (err.status == 404){
            this.alertas.push({ tipo: 'warning', mensagem: `Aviso: O usuário não possui cadastro de vendedor` });
          } 
            throw 'Erro ao recuperar o vendedor! Detalhes: ' + err.error?.error;
        })).subscribe((vendedor) => {
          console.log('vendedor encontrado', vendedor);
          this.inicial.vendedor = vendedor;
        });  
    }

    this.criarFormulario();
    this.erroCarregando = false;
    this.carregando = true;
    this.produtoService.listarComSaldo().pipe(catchError(
      err => {
        this.erroCarregando = true;
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar produtos! Detalhes ${err.error?.error}` });
        throw 'Erro ao recuperar produtos! Detalhes: ' + err.error?.error;
      })).subscribe((produtos) => {
        this.produtos = produtos;
        this.ordernarNome(this.produtos);
        console.log(produtos);

        this.vendedorService.listar().pipe(catchError(
          err => {
            this.erroCarregando = true;
            this.carregando = false;
            this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar vendedores! Detalhes ${err.error?.error}` });
            throw 'Erro ao recuperar vendedores! Detalhes: ' + err.error?.error;
          })).subscribe((vendedores) => {
            this.vendedores = vendedores;
            this.ordernarNome(this.vendedores);
            console.log(vendedores);

            if (this.operacao != 'Cadastrar') {
              this.erroCarregando = false;
              this.carregando = true;
              this.vendaService.buscarPorId(id!).pipe(catchError(
                err => {
                  this.erroCarregando = true;
                  this.carregando = false;
                  this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar a venda!' });
                  throw 'Erro ao recuperar a venda! Detalhes: ' + err;
                })).subscribe((venda) => {
                  this.carregando = false;
                  if (venda != null) {
                    this.inicial = venda;
                    this.itensVenda = venda.itensVenda!;
                    this.criarFormulario();
                    this.atualizarTabela();
                  } else {
                    this.alertas.push({ tipo: 'danger', mensagem: 'Venda não encontrada!' });
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
    // Criação da venda
    let venda: Venda = {
      data: this.formulario.value.data,
      numero: this.formulario.value.numero,
      id_vendedor : this.formulario.value.vendedor._id,
      itensVenda: this.itensVenda
    };

    this.salvandoFormulario(true);
    this.cadastrarVenda(venda);
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Cadastrar') || this.listar) {
      this.router.navigate(['/vendas']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }
  }

  formularioValido(): boolean {
    return this.formulario.get('data')!.valid && this.formulario.get('vendedor')!.valid && this.formulario.get('numero')!.valid && this.itensVenda.length > 0;
  }

  formularioIncluirValido(): boolean {
    return this.formulario.get('produto')!.valid && this.formulario.get('quantidade')!.valid && this.formulario.get('desconto')!.valid;
  }

  vendedorValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if ((control.value !== undefined) && !(typeof control.value != 'string')) {
        return { 'vendedorCadastrado': true };
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

  quantidadeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if ((control.value !== undefined) && this.formulario && this.formulario.get('produto')!.valid) {
        if (this.formulario.value.produto.quantidade! < control.value){
           return { 'quantidadeProduto': true };
        }   
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
      vendedor: [{value: this.inicial.vendedor, disabled: this.readOnly()}, Validators.compose([
        Validators.required, this.vendedorValidator()
      ])],
      numero: [{value: this.inicial.numero, disabled: this.readOnly()}],
      produto: [{value: '', disabled: this.readOnly()}, Validators.compose([
        Validators.required, this.produtoValidator()
      ])],
      precoUnitario: [{value: '', disabled: true}],      
      quantidade: [{value: 0, disabled: this.readOnly()}, Validators.compose([
        Validators.required, Validators.min(0.01), this.quantidadeValidator()
      ])],
      precoTotal: [{value: '', disabled: true}],      
      desconto: [{value: 0, disabled: this.readOnly()}, Validators.compose([
        Validators.required, Validators.min(0)
      ])],
      precoFinal: [{value: '', disabled: true}],         
    });

    //Faz o filtro de produtos e garante que o valor do campo produto é um objeto
    this.produtosFiltrados = this.formulario.controls['produto'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        let produto;
        if (ehString && nome && (nome != '') && this.produtos && (this.produtos.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          produto = this.produtos.find(produto => produto.nome.toLowerCase() == nome.toLowerCase());
          if (produto) {
            this.formulario.get('produto')!.patchValue(produto, { emitEvent: false });
          }
        } else {
          produto = value;
        } 
        if (produto) {
          this.formulario.get('precoUnitario')!.patchValue(produto.preco, { emitEvent: false });
          console.log('preço unitário', produto.preco, this.formulario.value.quantidade);
          this.formulario.get('precoTotal')?.patchValue(produto.preco * this.formulario.value.quantidade);
          //atribuindo o valor do produto
           //this.formulario.get('preco')!.patchValue(produto.preco, { emitEvent: false });
           this.formulario.controls['quantidade'].enable();
           this.formulario.controls['desconto'].enable();
        } else {
           this.formulario.controls['quantidade'].disable();
           this.formulario.controls['desconto'].disable();
        }

        return nome ? this._filterProduto(nome as string) : this.produtos.slice();
      }),
    );

    this.formulario.valueChanges.subscribe(value => {
      console.log(value);
      console.log('quantidade', this.formulario.value.produto, value);
      if (this.formulario.get('produto')!.valid && this.formulario.get('quantidade')!.valid){
        this.formulario.get('precoTotal')?.patchValue(value.produto.preco * value.quantidade, { emitEvent: false });

        if (this.formulario.get('desconto')!.valid){
          this.formulario.get('precoFinal')?.patchValue((value.produto.preco * value.quantidade) - value.desconto, { emitEvent: false });
        }
      }
    });

    //Faz o filtro de vendedores e garante que o valor do campo vendedor é um objeto
    this.vendedoresFiltrados = this.formulario.controls['vendedor'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        if (ehString && nome && (nome != '') && this.vendedores && (this.vendedores.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          let vendedor = this.vendedores.find(vendedor => vendedor.nome.toLowerCase() == nome.toLowerCase());
          if (vendedor) {
            this.formulario.get('vendedor')!.patchValue(vendedor, { emitEvent: false });
          }
        }
        return nome ? this._filterVendedor(nome as string) : this.vendedores.slice();
      }),
    );
  }

  private cadastrarVenda(venda: Venda) {
    this.vendaService.criar(venda).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao cadastrar venda! Detalhes: ${err.error?.error}`});
        throw 'Erro ao cadastrar venda. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Venda cadastrada com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
          this.itensVenda = [];
          this.atualizarTabela();
        });
  }

  readOnly() {
    return this.salvando || this.erroCarregando || this.leitura;
  }

  adicionarItem() {
    let itemVenda: ItemVenda = {
      preco: (this.formulario.value.produto.preco * this.formulario.value.quantidade) - this.formulario.value.desconto,
      quantidade: this.formulario.value.quantidade,
      id_produto: this.formulario.value.produto._id,
      produto: this.formulario.value.produto,
      desconto: this.formulario.value.desconto,
      precoCusto: this.formulario.value.produto.precoCusto,
      precoUnitario: this.formulario.value.produto.preco,
    };
    //https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
    itemVenda.preco = Math.round(itemVenda.preco * 100) / 100; //arredondar em 2 digitos

    this.itensVenda.push(itemVenda);
    this.produtos.splice(this.produtos.indexOf(itemVenda.produto!), 1);
    // resetando parte do formulario
    this.resetAdicionarProduto();
    this.atualizarTabela();
  }

  private resetAdicionarProduto() {
    let campos = ['quantidade', 'desconto'];
    campos.map(campo => {
      this.formulario.get(campo)?.setValue(0);
      this.formulario.get(campo)?.markAsUntouched();
    });
    this.formulario.get('produto')?.setValue('');
    this.formulario.get('produto')?.markAsUntouched();
  }

  confirmarExcluirItemVenda(itemVenda: ItemVenda) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão da venda produto '${itemVenda.produto?.nome}'?`,
        titulo: 'Confirmação de Exclusão de Venda de Produto'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      if (result == 'Sim') {
        this.itensVenda.splice(this.itensVenda.indexOf(itemVenda), 1);
        this.produtos.push(itemVenda.produto!);
        this.ordernarNome(this.produtos);
        this.resetAdicionarProduto();
        this.atualizarTabela();
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
      this.formulario.get('precoUnitario')?.disable();
      this.formulario.get('precoTotal')?.disable();
      this.formulario.get('precoFinal')?.disable();
    }
  }
}

