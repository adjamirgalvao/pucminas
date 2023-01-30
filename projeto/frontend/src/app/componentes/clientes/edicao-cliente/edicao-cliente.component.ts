import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Cliente } from 'src/app/interfaces/Cliente';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edicao-cliente',
  templateUrl: './edicao-cliente.component.html',
  styleUrls: ['./edicao-cliente.component.css']
})
export class EdicaoClienteComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: ClienteService,
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

  inicial: Cliente = {
    nome: '',
    cpf: '',
    dataNascimento: new Date(),
    endereco: {
      rua: '',
      numero: '',
      complemento: ''
    }
  };

  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;
  
  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    if (!this.operacao){
       this.operacao = (id == null) ? 'Cadastrar' : this.router.url.indexOf('editar') > 0 ? 'Editar' : 'Consultar';
    }

    if (this.operacao == 'Consultar'){
      this.leitura = true;
    }

    this.criarFormulario();
    if (this.operacao != 'Cadastrar') {
      this.erroCarregando = false;
      this.carregando = true;
      this.service.buscarPorId(id!).pipe(catchError(
        err => {
          this.erroCarregando = true;
          this.carregando = false;
          this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar o cliente!' });
          throw 'Erro ao recuperar o cliente! Detalhes: ' + err;
        })).subscribe((cliente) => {
          this.carregando = false;
          if (cliente != null) {
            this.inicial = cliente;
            console.log('inicial', this.inicial);
            this.criarFormulario();
          } else {
            this.alertas.push({ tipo: 'danger', mensagem: 'Cliente não encontrado!' });
            this.erroCarregando = true;
          }
        });
    }
  }

  salvar(): void {
    // Criação do cliente
    const cliente: Cliente = {
      nome: this.formulario.value.nome,
      dataNascimento: this.formulario.value.dataNascimento,
      cpf: this.formulario.value.cpf,
      endereco : {
        rua : this.formulario.value.rua,
        numero: this.formulario.value.numero,
        complemento: this.formulario.value.complemento
      }
    };

    this.salvando = true;
    if (this.operacao == 'Cadastrar') {
      this.cadastrarCliente(cliente);
    } else {
      cliente._id = this.inicial._id!;
      this.editarCliente(cliente);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Cadastrar') || this.listar) {
        this.router.navigate(['/clientees']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }    
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    this.formulario = this.formBuilder.group({
      nome: [{value: this.inicial.nome, disabled: this.readOnly()}, Validators.compose([
        Validators.required,
        Validators.pattern(/(.|\s)*\S(.|\s)*/)
      ])],
      cpf: [{value: this.inicial.cpf, disabled: this.readOnly()}, Validators.required],
      dataNascimento: [{value: this.inicial.dataNascimento, disabled: this.readOnly()}, Validators.required],
      rua: [{value: this.inicial.endereco.rua, disabled: this.readOnly()}, Validators.required],
      numero: [{value: this.inicial.endereco.numero, disabled: this.readOnly()}, Validators.required],
      complemento: [{value: this.inicial.endereco.complemento, disabled: this.readOnly()}],

    });
  }

  private cadastrarCliente(cliente: Cliente) {
    this.service.criar(cliente).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao cadastrar cliente!' });
        throw 'Erro ao cadastrar cliente. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Cliente "${cliente.nome}" cadastrado com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarCliente(cliente: Cliente) {
    this.salvando = true;
    this.service.editar(cliente).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao editar cliente!' });
        throw 'Erro ao editar cliente. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/clientees'],  {state: {alerta: {tipo: 'success', mensagem: `Cliente "${cliente.nome}" salvo com sucesso!`} }});
        });
  }


}
