import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';

import { ProdutoService } from '../../../services/produto.service';
import { Alerta } from '../../../interfaces/Alerta';
import { Produto } from './../../../interfaces/Produto';


@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar-produto.component.html',
  styleUrls: ['./criar-produto.component.css']
})

export class CriarProdutoComponent {
  constructor(
    private formBuilder: FormBuilder,
    private service: ProdutoService) {
  }

  alertas: Alerta[] = [];
  salvando: boolean = false;

  inicial = {
    nome: '',
    quantidade: 0,
    preco: 0
  };

  criarProdutoForm = this.formBuilder.group(this.inicial);

  criarProduto(): void {
    // Criação do produto
    const produto: Produto = {
      nome: this.criarProdutoForm.value.nome || this.inicial.nome,
      quantidade: this.criarProdutoForm.value.quantidade || this.inicial.quantidade,
      preco: this.criarProdutoForm.value.preco || this.inicial.preco
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
          this.alertas.push({ tipo: 'success', mensagem: 'Produto cadastrado com sucesso!' });
          this.criarProdutoForm.reset(this.inicial);
        });
  }
}
