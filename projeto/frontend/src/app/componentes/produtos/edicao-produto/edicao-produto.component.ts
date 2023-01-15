import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';

import { ProdutoService } from '../../../services/produto/produto.service';
import { Alerta } from '../../../interfaces/Alerta';
import { Produto } from '../../../interfaces/Produto';

@Component({
  selector: 'app-edicao-produto',
  templateUrl: './edicao-produto.component.html',
  styleUrls: ['./edicao-produto.component.css']
})

export class EdicaoProdutoComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: ProdutoService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute) {
  }
  formulario!: FormGroup;

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;

  inicial: Produto = {
    nome: '',
    quantidade: 0,
    preco: 0,
    precoCusto: 0
  };

  operacao!: string;

  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    this.operacao = (id == null) ? 'Cadastrar' : 'Editar';

    this.criarFormulario();
    if (this.operacao == 'Editar') {
      this.erroCarregando = false;
      this.carregando = true;
      this.service.buscarPorId(id!).pipe(catchError(
        err => {
          this.erroCarregando = true;
          this.carregando = false;
          this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar o produto!' });
          throw 'Erro ao recuperar o produto! Detalhes: ' + err;
        })).subscribe((produto) => {
          this.carregando = false;
          if (produto != null) {
            this.inicial = produto;
            console.log('inicial', this.inicial);
            this.criarFormulario();
          } else {
            this.alertas.push({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
            this.erroCarregando = true;
          }
        });
    }
  }

  salvar(): void {
    // Criação do produto
    const produto: Produto = {
      nome: this.formulario.value.nome,
      quantidade: this.formulario.value.quantidade,
      preco: this.formulario.value.preco,
      precoCusto: this.formulario.value.precoCusto
    };

    this.salvando = true;
    if (this.operacao == 'Cadastrar') {
      this.cadastrarProduto(produto);
    } else {
      produto._id = this.inicial._id!;
      this.editarProduto(produto);
    }
  }

  cancelar(): void {
    //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
    this.location.back();
  }

  private criarFormulario() {
    this.formulario = this.formBuilder.group({
      nome: [this.inicial.nome, Validators.compose([
        Validators.required,
        Validators.pattern(/(.|\s)*\S(.|\s)*/)
      ])],
      quantidade: [this.inicial.quantidade, Validators.compose([
        Validators.required, Validators.min(0)
      ])],
      preco: [this.inicial.preco, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])],
      precoCusto: [this.inicial.precoCusto, Validators.compose([
        Validators.required, Validators.min(0)
      ])]
    });
  }

  private cadastrarProduto(produto: Produto) {
    this.service.criar(produto).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao cadastrar produto!' });
        throw 'Erro ao cadastrar produto. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Produto "${produto.nome}" cadastrado com sucesso!` });
          this.formulario.reset(this.inicial);
          // Para resetar os erros https://stackoverflow.com/questions/55776775/how-to-reset-validation-error-without-resetting-form-in-angular
          Object.keys(this.formulario.controls).forEach(key => {
            this.formulario.get(key)!.setErrors(null);
          });
        });
  }

  private editarProduto(produto: Produto) {
    this.salvando = true;
    this.service.editar(produto).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao editar produto!' });
        throw 'Erro ao editar produto. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/produtos'],  {state: {alerta: {tipo: 'success', mensagem: `Produto "${produto.nome}" cadastrado com sucesso!`} }});
        });
  }

}
