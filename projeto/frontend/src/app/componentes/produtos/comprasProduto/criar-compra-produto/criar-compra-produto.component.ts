import { NotaFiscalCompraService } from './../../../../services/notaFiscalCompra/nota-fiscal-compra.service';
import { NotaFiscalCompra } from './../../../../interfaces/NotaFiscalCompra';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Compra } from 'src/app/interfaces/Compra';
import { Produto } from 'src/app/interfaces/Produto';
import { CompraService } from 'src/app/services/compra/compra.service';
import { Location } from '@angular/common';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ProdutoService } from 'src/app/services/produto/produto.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
    private compraService: CompraService,
    private notaFiscalService: NotaFiscalCompraService,
    private location: Location,
    private route: ActivatedRoute) {
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
  criarCompraProdutoForm: any;


  private criarCompra(notaComprada: NotaFiscalCompra) {
    const compra: Compra = {
      id_produto: this.produto._id!,
      id_nota: notaComprada._id,
      quantidade: this.criarCompraProdutoForm.value.quantidade,
      preco: this.criarCompraProdutoForm.value.preco
    };

    this.compraService.criarCompra(compra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao salvar compra do produto!' });
        throw 'Erro ao salvar compra do produto. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          //this.alertasEditar.push({ tipo: 'success', mensagem: 'Produto salvo com sucesso!' });
          this.location.back();
        });
  }

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

    this.criarCompraProdutoForm = this.formBuilder.group(this.compra);
  }

  comprarProduto(): void {
    // Nota Fiscal
    const nota: NotaFiscalCompra = {
      data: this.criarCompraProdutoForm.value.data,
      numero: this.criarCompraProdutoForm.value.numero
    };

    this.salvando = true;
    this.notaFiscalService.criarNota(nota).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao salvar compra do produto!' });
        throw 'Erro ao salvar compra do produto. Detalhes: ' + err;
      })).subscribe(
        (notaComprada) => {
          // Compra do produto
          this.criarCompra(notaComprada);
        });
  }


  cancelar(): void {
    //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
    this.location.back();
  }
}
