import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Alerta } from './../../../interfaces/alerta';

@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar-produto.component.html',
  styleUrls: ['./criar-produto.component.css']
})

export class CriarProdutoComponent {
  alertas: Alerta[] = [];

  criarProdutoForm = this.formBuilder.group({
    nome: '',
    quantidade: null,
    preco: null
  });


  constructor(
    private formBuilder: FormBuilder) { }

  criarProduto(): void {
    // Criação do produto
    console.warn('Produto criado foi', this.criarProdutoForm.value);
    this.alertas.push({ tipo: 'success', mensagem: 'Produto cadastrado com sucesso!' });
    this.criarProdutoForm.reset();
  }

}
