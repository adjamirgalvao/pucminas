import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Alerta } from './../../../interfaces/alerta';

import { ProdutoService } from '../../../services/produto.service';
import { Produto } from './../../../interfaces/Produto';

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
    private formBuilder: FormBuilder,
    private service: ProdutoService) { }

  
  criarProduto(): void {
    // Criação do produto
    const produto : Produto = {nome: this.criarProdutoForm.value.nome || "", 
                              quantidade : this.criarProdutoForm.value.quantidade || 0,
                              preco : this.criarProdutoForm.value.preco || 0.0
                            };

                            console.log(produto);
    this.service.criar(produto).subscribe(() => {
      this.alertas.push({ tipo: 'success', mensagem: 'Produto cadastrado com sucesso!' });
      console.warn('Produto criado foi', this.criarProdutoForm.value);
      this.criarProdutoForm.reset();
      });
    
  
  }


}
