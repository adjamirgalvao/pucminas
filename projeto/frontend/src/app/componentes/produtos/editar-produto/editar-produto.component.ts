import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProdutoService } from '../../../services/produto.service';
import { Location } from '@angular/common';
import { catchError } from 'rxjs';
import { Alerta } from '../../../interfaces/Alerta';
import { Produto } from '../../../interfaces/Produto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editar-produto',
  templateUrl: './editar-produto.component.html',
  styleUrls: ['./editar-produto.component.css']
})
export class EditarProdutoComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private service: ProdutoService,
    private location: Location,
    private route: ActivatedRoute) {
  }

  alertas: Alerta[] = [];
  salvando: boolean = false;
  erroCarregando : boolean = false;

  produto: Produto = {
    _id: '',
    nome: '',
    quantidade: 0,
    preco: 0,
    precoCusto: 0
  }
  editarProdutoForm: any;

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
        this.editarProdutoForm = this.formBuilder.group(this.produto);
      } else {
        this.alertas.push({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
        this.erroCarregando = true;
      }
    });

    this.editarProdutoForm = this.formBuilder.group(this.produto);
  }

  editarProduto(): void {
    // Criação do produto
    const produto: Produto = {
      _id: this.produto._id,
      nome: this.editarProdutoForm.value.nome || this.produto.nome,
      quantidade: this.editarProdutoForm.value.quantidade || this.produto.quantidade,
      preco: this.editarProdutoForm.value.preco || this.produto.preco,
      precoCusto: this.editarProdutoForm.value.precoCusto || this.produto.precoCusto
    };

    this.salvando = true;
    this.service.editar(produto).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao editar produto!' });
        throw 'Erro ao editar produto. Detalhes: ' + err;
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
