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
  alertas: Alerta[] = [];
  salvando: boolean = false;

  criarProdutoForm = this.formBuilder.group({
    nome: '',
    quantidade: null,
    preco: null
  });


  constructor(
    private formBuilder: FormBuilder,
    private service: ProdutoService) {
  }
  
  criarProduto(): void {
    // Criação do produto
    const produto : Produto = {nome: this.criarProdutoForm.value.nome || "", 
                              quantidade : this.criarProdutoForm.value.quantidade || 0,
                              preco : this.criarProdutoForm.value.preco || 0.0
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
        this.criarProdutoForm.reset();
      });
  } 


}
