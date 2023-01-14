import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';

import { ProdutoService } from '../../../services/produto/produto.service';
import { Alerta } from '../../../interfaces/Alerta';
import { Produto } from './../../../interfaces/Produto';

@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar-produto.component.html',
  styleUrls: ['./criar-produto.component.css']
})

export class CriarProdutoComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: ProdutoService,
    private location: Location,
    private route: ActivatedRoute) {
  }
  formulario! : FormGroup;

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;

  inicial = {
    nome: '',
    quantidade: 0,
    preco: 0,
    precoCusto: 0
  };
  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');

    this.formulario = this.formBuilder.group({
      nome: [this.inicial.nome, Validators.compose([
        Validators.required
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

  criarProduto(): void {
    // Criação do produto
    const produto: Produto = {
      nome: this.formulario.value.nome,
      quantidade: this.formulario.value.quantidade,
      preco: this.formulario.value.preco,
      precoCusto: this.formulario.value.precoCusto
    };

    this.salvando = true;
    this.service.criar(produto).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao cadastrar produto!' });
        throw 'Erro ao cadastrar produto. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: 'Produto cadastrado com sucesso!' });
          this.formulario.reset(this.inicial);
          // Para resetar os erros https://stackoverflow.com/questions/55776775/how-to-reset-validation-error-without-resetting-form-in-angular
          Object.keys(this.formulario.controls).forEach(key => {
            this.formulario.get(key)!.setErrors(null);
          });
        });
  }

  cancelar(): void {
    //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
    this.location.back();
  }
}
