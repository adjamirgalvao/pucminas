import { AuthService } from './../../../services/autenticacao/auth/auth.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { Cliente } from 'src/app/interfaces/Cliente';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-editar-venda',
  templateUrl: './editar-venda.component.html',
  styleUrls: ['./editar-venda.component.css']
})
export class EditarVendaComponent implements OnInit, OnDestroy {
  constructor(     
    private deviceService: DeviceDetectorService,   
    private formBuilder: FormBuilder,
    private vendaService: VendaService,
    private produtoService: ProdutoService,
    private vendedorService: VendedorService,
    private clienteService: ClienteService,
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
    // https://stackoverflow.com/questions/45184969/get-current-url-in-angular
    if (this.router.url.indexOf('/meusPedidos') > -1) {
        this.operacao = 'Meus Pedidos';  
    }   
  }

  @ViewChild('produto') inputProduto!: ElementRef;

  @ViewChild('inicio') inputInicio!: ElementRef;

  private setFocusInicial() {
    //Sem isso dá O erro ExpressionChangedAfterItHasBeenCheckedError 
    //Isso agendará a atualização da propriedade para a próxima iteração do ciclo de vida do Angular, permitindo que a detecção de alterações seja concluída antes que a propriedade seja atualizada.
    setTimeout(() => { this.inputInicio.nativeElement.focus(); }, 0);
  }
  
  handlerOrientation: any;
  
  ngOnDestroy(): void {
    console.log('on destroy');
    //https://stackoverflow.com/questions/46906763/how-to-remove-eventlisteners-in-angular-4
    //https://code.daypilot.org/79036/angular-calendar-detect-orientation-change-landscape-portrait
    this.landscape.removeEventListener("change", this.handlerOrientation, true);
  }

  private onChangeOrientation() {
    console.log('landscape orientation');
  }

  //https://code.daypilot.org/79036/angular-calendar-detect-orientation-change-landscape-portrait
  landscape = window.matchMedia("(orientation: landscape)");

  formulario!: FormGroup;

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;
  leitura: boolean = false;

  inicial: Venda = {
    data: new Date(),
  };

  itensVenda: ItemVenda[] = [];
  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;

  // Campos para a tabela
  displayedColumns = [{ def: 'produto.nome', showMobile: true}, { def: 'quantidade', showMobile: true}, { def: 'precoUnitario', showMobile: false}, { def: 'precoTotal', showMobile: false}, { def: 'desconto', showMobile: false}, { def: 'precoFinal', showMobile: true}];
  dataSource: MatTableDataSource<ItemVenda> = new MatTableDataSource();

  //Sem isso não consegui fazer funcionar o sort e paginator https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
  private paginator!: MatPaginator;
  private sort!: MatSort;

  //Filtro de produtos
  produtosBase: Produto[] = [];
  produtos: Produto[] = [];
  produtosFiltrados!: Observable<Produto[]>;
  
  //Filtro de vendedores
  vendedores: Vendedor[] = [];
  vendedoresFiltrados!: Observable<Vendedor[]>;
  
  //Filtro de clientes
  clientes: Cliente[] = [];
  clientesFiltrados!: Observable<Cliente[]>;


  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  isPortrait() {
    return !this.landscape.matches;
  }  
  
  //https://stackoverflow.com/questions/47077302/angular2-material-table-hide-column
  getDisplayedColumns() : string[] {
    let exibir = !this.isPortrait();
    return this.displayedColumns.filter(cd => exibir || cd.showMobile).map(cd => cd.def);
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

  displayFnCliente(cliente: Cliente): string {
    return cliente && cliente.nome ? cliente.nome : '';
  }

  private _filterCliente(nome: string): Cliente[] {
    const filterValue = nome.toLowerCase();

    return this.clientes.filter(cliente => cliente.nome.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    //https://code.daypilot.org/79036/angular-calendar-detect-orientation-change-landscape-portrait
    this.handlerOrientation = this.onChangeOrientation.bind(this);
    this.landscape.addEventListener("change", this.handlerOrientation, true);   
        
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    if (!this.operacao){
      this.operacao = (id == null) ? 'Nova' : this.router.url.indexOf('editar') > 0 ? 'Editar' : 'Detalhar';
    }

    if ((this.operacao != 'Detalhar') && (this.operacao != 'Meus Pedidos')){
      this.displayedColumns.push({ def: 'acoes', showMobile: true});
    } else {
      this.leitura = true;
    }
    if ((this.operacao == 'Nova') && this.authService.isLogado() && this.authService.isVendedor()){
      this.vendedorService.buscarPorEmail(this.authService.getUsuario().email!).pipe(catchError(
        err => {
          //this.erroCarregando = true;
          this.carregando = false;
          if (err.status == 404){
            this.adicionarAlerta({ tipo: 'warning', mensagem: `Aviso: O usuário não possui cadastro de vendedor` });
          } 
            throw 'Erro ao recuperar o vendedor! Detalhes: ' + err.error?.error;
        })).subscribe((vendedor) => {
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
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar produtos! Detalhes ${err.error?.error}` });
        throw 'Erro ao recuperar produtos! Detalhes: ' + err.error?.error;
      })).subscribe((produtos) => {
        this.produtos = produtos;
        this.produtosBase = [...produtos]; //senão vai apontar para o mesmo objeto
        this.ordernarNome(this.produtos);
        console.log(produtos);

        this.vendedorService.listar().pipe(catchError(
          err => {
            this.erroCarregando = true;
            this.carregando = false;
            this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar vendedores! Detalhes ${err.error?.error}` });
            throw 'Erro ao recuperar vendedores! Detalhes: ' + err.error?.error;
          })).subscribe((vendedores) => {
            this.vendedores = vendedores;
            this.ordernarNome(this.vendedores);
            console.log(vendedores);

            this.clienteService.listar().pipe(catchError(
              err => {
                this.erroCarregando = true;
                this.carregando = false;
                this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar clientes! Detalhes ${err.error?.error}` });
                throw 'Erro ao recuperar clientes! Detalhes: ' + err.error?.error;
              })).subscribe((clientes) => {
                this.clientes = clientes;
                this.ordernarNome(this.clientes);
                console.log(clientes);

                if (this.operacao != 'Nova') {
                    this.vendaService.buscarPorId(id!).pipe(catchError(
                      (err: HttpErrorResponse)  => {
                        this.erroCarregando = true;
                        this.carregando = false;
                        if (err.status == 404) {
                          this.adicionarAlerta({ tipo: 'danger', mensagem: 'Venda não encontrada!' });
                          this.leitura = true;
                          this.criarFormulario();
                        } else {
                          this.adicionarAlerta({ tipo: 'danger', mensagem: 'Erro ao recuperar a venda!' });
                        }
                         throw 'Erro ao recuperar a venda! Detalhes: ' + err;
                   })).subscribe((venda) => {
                      this.carregando = false;
                      if (venda != null) {
                        this.inicial = venda;
                        this.itensVenda = venda.itensVenda!;
                        this.filtrarListaProdutos();
                        this.criarFormulario();
                        this.atualizarTabela();
                        this.setFocusInicial();
                      } else {
                      this.adicionarAlerta({ tipo: 'danger', mensagem: 'Venda não encontrada!' });
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
    });

  }

  salvar(): void {
    // Criação da venda
    let venda: Venda = {
      data: this.formulario.value.data,
      itensVenda: this.itensVenda
    };
    if (this.formulario.get('cliente')?.valid && (this.formulario.value.cliente)) {
      venda.id_cliente = this.formulario.value.cliente._id;
    }
    if (this.formulario.get('vendedor')?.valid && (this.formulario.value.vendedor)) {
      venda.id_vendedor = this.formulario.value.vendedor._id;
    }

    this.salvandoFormulario(true);
    if (this.operacao == 'Nova') {
      this.cadastrarVenda(venda);
    } else {
      venda._id = this.inicial._id!;
      this.editarVenda(venda);
    }    

  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if (this.operacao == 'Meus Pedidos'){
      this.router.navigate(['/meusPedidos']);
    }  else {
      if ((this.operacao != 'Nova') || this.listar) {
        this.router.navigate(['/vendas']);
      } else {
        //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
        this.location.back();
      }
    }
  }

  formularioValido(): boolean {
    return this.formulario.get('data')!.valid && this.formulario.get('vendedor')!.valid && this.itensVenda.length > 0;
  }

  formularioIncluirValido(): boolean {
    return this.formulario.get('produto')!.valid && this.formulario.get('quantidade')!.valid && this.formulario.get('desconto')!.valid;
  }

  vendedorValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      //Segunda condição deixa o vendedor ser opcional
      if ((control.value !== undefined) && (control.value != '') && !(typeof control.value != 'string')) {
        return { 'vendedorCadastrado': true };
      }
      return null;
    }
  }

  clienteValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      //aqui eu deixo o cliente ficar vazio.
      if ((control.value !== undefined) && (control.value != '') && !(typeof control.value != 'string')) {
        console.log("valor cliente", control.value);
        return { 'clienteCadastrado': true };
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
      vendedor: [{value: this.inicial.vendedor, disabled: this.readOnly()}, this.vendedorValidator()],
      cliente: [{value: this.inicial.cliente, disabled: this.readOnly()}, this.clienteValidator()],
      produto: [{value: '', disabled: this.readOnly()}, Validators.compose([
        Validators.required, this.produtoValidator()
      ])],
      precoUnitario: [{value: '', disabled: true}],      
      quantidade: [{value: '', disabled: this.readOnly()}, Validators.compose([
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
           this.formulario.get('precoTotal')?.patchValue(produto.preco * this.formulario.value.quantidade);
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

    //Faz o filtro de clientes e garante que o valor do campo vendedor é um objeto
    this.clientesFiltrados = this.formulario.controls['cliente'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        if (ehString && nome && (nome != '') && this.clientes && (this.clientes.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          let cliente = this.clientes.find(cliente => cliente.nome.toLowerCase() == nome.toLowerCase());
          if (cliente) {
            this.formulario.get('cliente')!.patchValue(cliente, { emitEvent: false });
          }
        }
        return nome ? this._filterCliente(nome as string) : this.clientes.slice();
      }),
    );    
  }

  private cadastrarVenda(venda: Venda) {
    this.vendaService.criar(venda).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao cadastrar venda! Detalhes: ${err.error?.error}`});
        throw 'Erro ao cadastrar venda. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = [];
          this.adicionarAlerta({ tipo: 'success', mensagem: `Venda cadastrada com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
          this.itensVenda = [];
          this.atualizarTabela();
          this.setFocusInicial();
        });
  }

  private editarVenda(venda: Venda) {
    this.vendaService.editar(venda).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: 'Erro ao editar venda!' });
        throw 'Erro ao editar venda. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/vendas'],  {state: {alerta: {tipo: 'success', mensagem: `Venda salva com sucesso!`} }});
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
    this.alertas = [];
    this.adicionarAlerta({ tipo: 'success', mensagem: `Produto '${itemVenda.produto!.nome}' adicionado a venda.` })
    this.atualizarTabela();
  }

  private resetAdicionarProduto() {
    this.formulario.get('quantidade')?.setValue('');
    this.formulario.get('quantidade')?.markAsUntouched();

    this.formulario.get('desconto')?.setValue(0);
    this.formulario.get('desconto')?.markAsUntouched();

    this.formulario.get('produto')?.setValue('');
    this.formulario.get('produto')?.markAsUntouched();
    this.inputProduto.nativeElement.focus();
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
        let produto = this.localizarProdutoPorId(itemVenda.produto!._id!);
        if (produto){
          this.produtos.push(produto);
          this.ordernarNome(this.produtos);
        }
        this.resetAdicionarProduto();
        this.atualizarTabela();
      }
    });
  }

  // Remove os produtos que já existem no itensVenda
  private filtrarListaProdutos() {
    for (let i = 0; i < this.itensVenda.length; i++) {
      const produto =  this.itensVenda[i].produto;
      for (let j = 0; j < this.produtos.length; j++) {
        if (this.produtos[j]._id === produto!._id) {
          this.produtos.splice(j, 1);
          j--; // atualiza o índice para compensar a remoção
        }
      }
    }
  }

  private localizarProdutoPorId(id : string) {
    console.log(this.produtosBase, id);
    const produtoEncontrado = this.produtosBase.find((produto) => produto._id === id);
    console.log('produtoencontrado', produtoEncontrado);
    return produtoEncontrado || null; // retorna o produto encontrado ou null se não houver correspondência
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
   
  public adicionarAlerta(alerta: any){
    this.alertas.push(alerta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

