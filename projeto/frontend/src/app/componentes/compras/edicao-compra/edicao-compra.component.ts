import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';

import { Alerta } from '../../../interfaces/Alerta';
import { CompraService } from 'src/app/services/compra/compra.service';
import { Compra } from 'src/app/interfaces/Compra';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from 'src/app/constantes/Mydata';

@Component({
  selector: 'app-edicao-compra',
  templateUrl: './edicao-compra.component.html',
  styleUrls: ['./edicao-compra.component.css'],
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

export class EdicaoCompraComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: CompraService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let modo = this.router.getCurrentNavigation()?.extras.state?.['operacao'];
      if (modo) {
         this.operacao = modo;
         this.leitura = true;
      }
    }
  formulario!: FormGroup;

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;
  leitura: boolean = false;

  inicial: Compra = {
    numero: '',
    data: new Date()
  };

  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;
  
  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    if (!this.operacao){
       this.operacao = (id == null) ? 'Cadastrar' : 'Editar';
    }

    this.criarFormulario();
    if (this.operacao != 'Cadastrar') {
      this.erroCarregando = false;
      this.carregando = true;
      this.service.buscarPorId(id!).pipe(catchError(
        err => {
          this.erroCarregando = true;
          this.carregando = false;
          this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar a compra!' });
          throw 'Erro ao recuperar a compra! Detalhes: ' + err;
        })).subscribe((compra) => {
          this.carregando = false;
          if (compra != null) {
            this.inicial = compra;
            console.log('inicial', this.inicial);
            this.criarFormulario();
          } else {
            this.alertas.push({ tipo: 'danger', mensagem: 'Compra não encontrada!' });
            this.erroCarregando = true;
          }
        });
    }
  }

  salvar(): void {
    // Criação da compra
    const compra: Compra = {
      data: this.formulario.value.data,
      numero: this.formulario.value.numero,
     // preco: this.formulario.value.preco,
     // precoCusto: this.formulario.value.precoCusto
    };

    this.salvando = true;
    if (this.operacao == 'Cadastrar') {
      this.cadastrarCompra(compra);
    } else {
      compra._id = this.inicial._id!;
      this.editarCompra(compra);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Cadastrar') || this.listar) {
        this.router.navigate(['/compras']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }    
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    this.formulario = this.formBuilder.group({
      data: [this.inicial.data, Validators.compose([
        Validators.required
      ])],
      numero: [this.inicial.numero],        
    });
  }

  private cadastrarCompra(compra: Compra) {
    this.service.criar(compra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao cadastrar compra!' });
        throw 'Erro ao cadastrar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Compra "${compra.numero}" cadastrada com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarCompra(compra: Compra) {
    /*
    this.salvando = true;
    this.service.editar(compra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao editar compra!' });
        throw 'Erro ao editar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/compras'],  {state: {alerta: {tipo: 'success', mensagem: `Compra "${compra.numero}" salva com sucesso!`} }});
        });
    */    
  }

}
