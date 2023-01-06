import { Component } from '@angular/core';
import { FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar-produto.component.html',
  styleUrls: ['./criar-produto.component.css']
})

export class CriarProdutoComponent {

  criarProdutoForm = this.formBuilder.group({
    nome: '',
    estoque: null,
    preco: null
  });


  constructor(
    private formBuilder: FormBuilder){}

  criarProduto(): void {
    // Criação do produto
    console.warn('Your order has been submitted', this.criarProdutoForm.value);
    this.criarProdutoForm.reset();
  }

}
