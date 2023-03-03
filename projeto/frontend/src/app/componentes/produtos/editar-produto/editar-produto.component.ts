import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators, FormControl } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';

import { ProdutoService } from '../../../services/produto/produto.service';
import { Alerta } from '../../../interfaces/Alerta';
import { Produto } from '../../../interfaces/Produto';
import { HttpErrorResponse } from '@angular/common/http';

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
    private router: Router,
    private route: ActivatedRoute) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let modo = this.router.getCurrentNavigation()?.extras.state?.['operacao'];
      if (modo) {
         this.operacao = modo;
      }
    }
  formulario!: FormGroup;

  alertas: Set<Alerta> = new Set<Alerta>();
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;
  leitura: boolean = false;

  inicial! : Produto;

  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;
  
  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    this.operacao = (id == null) ? 'Novo' : this.router.url.indexOf('editar') > 0 ? 'Editar' : 'Detalhar';

    if (this.operacao == 'Detalhar'){
      this.leitura = true;
    }
  
    this.criarFormulario();
    if (this.operacao != 'Novo') {
      this.erroCarregando = false;
      this.carregando = true;
      this.service.buscarPorId(id!).pipe(catchError(
        (err: HttpErrorResponse) => {
          this.erroCarregando = true;
          this.carregando = false;
          if (err.status == 404) {
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
            this.leitura = true;
            this.criarFormulario();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar o produto! Detalhes: ${err.error}` });
          }
          throw 'Erro ao recuperar o produto! Detalhes: ' + err.error;
 
        })).subscribe((produto) => {
          this.carregando = false;
          if (produto != null) {
            this.inicial = produto;
            console.log('inicial', this.inicial);
            this.criarFormulario();
            this.setFocusInicial();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Produto não encontrado!' });
            this.erroCarregando = true;
          }
        });
    }
  }

  @ViewChild('inicio') inputInicio!: ElementRef;

  ngAfterViewInit() {
    if (this.operacao == 'Novo') {
      this.setFocusInicial();
    }
  }

  private setFocusInicial() {
    //Sem isso dá O erro ExpressionChangedAfterItHasBeenCheckedError 
    //Isso agendará a atualização da propriedade para a próxima iteração do ciclo de vida do Angular, permitindo que a detecção de alterações seja concluída antes que a propriedade seja atualizada.
    setTimeout(() => { this.inputInicio.nativeElement.focus(); }, 0);
  }

  salvar(): void {
    // Criação do produto
    let produto: Produto = {
      nome: this.formulario.value.nome,
      quantidade: this.formulario.value.quantidade,
      preco: this.formulario.value.preco,
      precoCusto: this.formulario.value.precoCusto
    };

    this.salvandoFormulario(true);
    if (this.operacao == 'Novo') {
      this.cadastrarProduto(produto);
    } else {
      produto._id = this.inicial._id!;
      this.editarProduto(produto);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Novo') || this.listar) {
        this.router.navigate(['/produtos']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }    
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    let novo = (this.operacao == 'Novo') || !this.inicial; 
    this.formulario = this.formBuilder.group({
      nome: [{value: novo? '' :  this.inicial.nome, disabled: this.readOnly()}, Validators.compose([
        Validators.required,
        Validators.pattern(/(.|\s)*\S(.|\s)*/)
      ])],
      quantidade: [{value: novo? '' : this.inicial.quantidade, disabled: this.readOnly()}, Validators.compose([
        Validators.required, Validators.min(0)
      ])],
      preco: [{value: novo? 0 : this.inicial.preco, disabled: this.readOnly()}, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])],
      precoCusto: [{value: novo? 0 : this.inicial.precoCusto, disabled: this.readOnly()}, Validators.compose([
        Validators.required, Validators.min(0)
      ])]
    });
  }

  private cadastrarProduto(produto: Produto) {
    this.service.criar(produto).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao cadastrar produto! Detalhes: ${err.error?.error}` });
        throw 'Erro ao cadastrar produto. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = new Set<Alerta>();
          this.adicionarAlerta({ tipo: 'success', mensagem: `Produto "${produto.nome}" cadastrado com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
          this.setFocusInicial();
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarProduto(produto: Produto) {
    this.salvandoFormulario(true);
    this.service.editar(produto).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao editar produto! Detalhes: ${err.error?.error}` });
        throw 'Erro ao editar produto. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/produtos'],  {state: {alerta: {tipo: 'success', mensagem: `Produto "${produto.nome}" salvo com sucesso!`} }});
        });
  }

  private salvandoFormulario(salvando: boolean){
    this.salvando = salvando;
    if (salvando) {
      this.formulario.disable();
    } else {
      this.formulario.enable();
    }
  }
   
  public adicionarAlerta(alerta: any){
    let novoAlerta = new Alerta(alerta.tipo, alerta.mensagem);
    const alertaEncontrado = [...this.alertas].find(alerta => alerta.tipo === novoAlerta.tipo && alerta.mensagem === novoAlerta.mensagem);

    if (!alertaEncontrado){
    this.alertas.add(new Alerta(alerta.tipo, alerta.mensagem));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
