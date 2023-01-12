import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Compra } from 'src/app/interfaces/Compra';
import { Produto } from 'src/app/interfaces/Produto';
import { ProdutoService } from 'src/app/services/produto.service';
import { Location } from '@angular/common';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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
    private service: ProdutoService,
    private location: Location,
    private route: ActivatedRoute) {
  }

  alertas: Alerta[] = [];
  salvando: boolean = false;
  erroCarregando : boolean = false;

  compra: Compra = {
    id_produto: '',
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.erroCarregando = false;
    this.service.buscarPorId(id!).subscribe((produto) => {
      if (produto != null) {
        this.produto = {
          _id: produto._id || '',
          nome: produto.nome || '',
          quantidade: produto.quantidade || 0,
          preco: produto.preco || 0,
          precoCusto: produto.precoCusto || 0
        };
        this.criarCompraProdutoForm = this.formBuilder.group(this.compra);
      } else {
        this.alertas.push({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
        this.erroCarregando = true;
      }
    });

    this.criarCompraProdutoForm = this.formBuilder.group(this.compra);
  }

  comprarProduto(): void {
    // Compra do produto
    const compra: Compra = {
      id_produto: this.produto._id!,
      data: this.criarCompraProdutoForm.value.data || this.compra.data,
      quantidade: this.criarCompraProdutoForm.value.quantidade || this.compra.quantidade,
      preco: this.criarCompraProdutoForm.value.preco || this.compra.preco
    };

    this.salvando = true;
    this.service.cadastrarCompra(compra).pipe(catchError(
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

  cancelar(): void {
    //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
    this.location.back();
  }
}