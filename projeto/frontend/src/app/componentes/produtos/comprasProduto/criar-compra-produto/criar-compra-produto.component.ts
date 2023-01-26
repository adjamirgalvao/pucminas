import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { ItemCompra } from 'src/app/interfaces/ItemCompra';
import { Produto } from 'src/app/interfaces/Produto';
import { ItemCompraService } from 'src/app/services/itemCompra/item-compra.service';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ProdutoService } from 'src/app/services/produto/produto.service';
import { MY_FORMATS } from 'src/app/constantes/Mydata';

// Alterar o formato de data do picker https://material.angular.io/components/datepicker/overview
@Component({
  selector: 'app-criar-compra-produto',
  templateUrl: './criar-compra-produto.component.html',
  styleUrls: ['./criar-compra-produto.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class CriarCompraProdutoComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private produtoService: ProdutoService,
    private itemCompraService: ItemCompraService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  alertas: Alerta[] = [];
  salvando: boolean = false;
  erroCarregando : boolean = false;
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
  formulario: any;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');

    this.erroCarregando = false;
    this.produtoService.buscarPorId(id!).subscribe((produto) => {
      if (produto != null) {
        this.produto = {
          _id: produto._id,
          nome: produto.nome,
          quantidade: produto.quantidade,
          preco: produto.preco,
          precoCusto: produto.precoCusto
        };
      } else {
        this.alertas.push({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
        this.erroCarregando = true;
      }
    });

    this.criarFormulario();
  }

  private criarFormulario() {
      this.formulario = this.formBuilder.group({
        data: [this.compra.data, Validators.compose([
          Validators.required
        ])],
        numero: [this.compra.numero],        
        quantidade: [this.compra.quantidade, Validators.compose([
          Validators.required, Validators.min(0.01)
        ])],
        preco: [this.compra.preco, Validators.compose([
          Validators.required, Validators.min(0.01)
        ])]
      });
  }

  comprarProduto(): void {
    this.salvando = true;
    const itemCompra: ItemCompra = {
      id_produto: this.produto._id!,
      quantidade: this.formulario.value.quantidade,
      preco: this.formulario.value.preco,
      dataCompra: this.formulario.value.data,
      numeroCompra: this.formulario.value.numero};

    this.itemCompraService.criarItemCompra(itemCompra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao salvar compra do produto!' });
        throw 'Erro ao salvar compra do produto. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
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
}
