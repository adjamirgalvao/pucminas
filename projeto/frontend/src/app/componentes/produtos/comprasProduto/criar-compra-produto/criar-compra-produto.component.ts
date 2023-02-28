import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map, Observable, startWith } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Compra } from 'src/app/interfaces/Compra';
import { Fornecedor } from 'src/app/interfaces/Fornecedor';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';
import { Produto } from 'src/app/interfaces/Produto';
import { CompraService } from 'src/app/services/compra/compra.service';
import { FornecedorService } from 'src/app/services/fornecedor/fornecedor.service';
import { ProdutoService } from 'src/app/services/produto/produto.service';

// Alterar o formato de data do picker https://material.angular.io/components/datepicker/overview
@Component({
  selector: 'app-criar-compra-produto',
  templateUrl: './criar-compra-produto.component.html',
  styleUrls: ['./criar-compra-produto.component.css'],
})
export class CriarCompraProdutoComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private produtoService: ProdutoService,
    private fornecedorService: FornecedorService,
    private compraService: CompraService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  alertas: Alerta[] = [];
  salvando: boolean = false;
  erroCarregando : boolean = false;
  carregando: boolean = false;
  listar: boolean = false;

  compra = {
    id_produto: '',
    numero: '',
    data: new Date(),
    quantidade: 0,
    preco: 0
  };
  
  produto: Produto = {
    _id: '',
    nome: '',
    quantidade: 0,
    preco: 0,
    precoCusto: 0
  }
  formulario!: FormGroup;

  //Filtro de fornecedores
  fornecedores: Fornecedor[] = [];
  fornecedoresFiltrados!: Observable<Fornecedor[]>;

  displayFnFornecedor(fornecedor: Fornecedor): string {
    return fornecedor && fornecedor.nome ? fornecedor.nome : '';
  }

  private _filterFornecedor(nome: string): Fornecedor[] {
    const filterValue = nome.toLowerCase();

    return this.fornecedores.filter(fornecedor => fornecedor.nome.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');

    this.erroCarregando = false;
    this.carregando = true;
    this.criarFormulario();
    this.produtoService.buscarPorId(id!).subscribe((produto) => {
      if (produto != null) {
        this.produto = {
          _id: produto._id,
          nome: produto.nome,
          quantidade: produto.quantidade,
          preco: produto.preco,
          precoCusto: produto.precoCusto
        };
        this.fornecedorService.listar().pipe(catchError(
          err => {
            this.erroCarregando = true;
            this.carregando = false;
            this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar fornecedores! Detalhes: ${err.error?.error}`});
            throw 'Erro ao recuperar fornecedores! Detalhes: ' + err.error?.error;
          })).subscribe((fornecedores) => {
            this.fornecedores = fornecedores;
            this.carregando = false;
            console.log('fornecedores', fornecedores);
            this.criarFormulario();
          })
      } else {
        this.adicionarAlerta({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
        this.erroCarregando = true;
        this.carregando = false;
      }
    });
  }

  fornecedorValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      // a segunda condição deixa cadastrar vendedor vazio
      if ((control.value !== undefined) && (control.value != '') && !(typeof control.value != 'string')) {
        return { 'fornecedorCadastrado': true };
      }
      return null;
    }
  }
  
  private criarFormulario() {
      this.formulario = this.formBuilder.group({
        data: [this.compra.data, Validators.compose([
          Validators.required
        ])],
        fornecedor: ['', this.fornecedorValidator()],
        numero: [this.compra.numero],        
        quantidade: [this.compra.quantidade, Validators.compose([
          Validators.required, Validators.min(0.01)
        ])],
        preco: [this.compra.preco, Validators.compose([
          Validators.required, Validators.min(0.01)
        ])]
      });

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

  comprarProduto(): void {
    this.salvandoFormulario(true);
    const itemCompra: ItemCompra = {
      id_produto: this.produto._id!,
      quantidade: this.formulario.value.quantidade,
      preco: this.formulario.value.preco
    };

    // Criação da compra
    let compra: Compra = {
      data: this.formulario.value.data,
      numero: this.formulario.value.numero,
      itensCompra: [itemCompra]
    };
    if (this.formulario.get('fornecedor')?.valid && (this.formulario.value.fornecedor)) {
      compra.id_fornecedor = this.formulario.value.fornecedor._id;
    }   

    this.compraService.criar(compra).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao salvar compra do produto! Detalhes: ${err.error?.error}` });
        throw 'Erro ao salvar compra do produto. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          let extras = {state: {alerta: {tipo: 'success', mensagem: `Compra do "${this.produto.nome}" cadastrada com sucesso!`} }};
          if (this.listar) {
            this.router.navigate(['/produtos/' + this.produto._id + '/listarComprasProduto'], extras);
         } else {
            this.router.navigate(['/produtos/'],  extras);
         }   
        });
  }

  cancelar(): void {
      if (this.listar) {
         this.router.navigate(['/produtos/' + this.produto._id + '/listarComprasProduto']);
      } else {
         this.router.navigate(['/produtos/']);
      }
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
    this.alertas.push(alerta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
