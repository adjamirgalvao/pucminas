import { Fornecedor } from 'src/app/interfaces/Fornecedor';
import { FornecedorService } from 'src/app/services/fornecedor/fornecedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';
import { Alerta } from 'src/app/interfaces/Alerta';

@Component({
  selector: 'app-editar-fornecedor',
  templateUrl: './editar-fornecedor.component.html',
  styleUrls: ['./editar-fornecedor.component.css']
})

export class EditarFornecedorComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: FornecedorService,
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

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;
  leitura: boolean = false;

  inicial: Fornecedor = {
    nome: '',
    identificacao: '',
    tipo: '',
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
    this.operacao = (id == null) ? 'Novo' : this.router.url.indexOf('editar') > 0 ? 'Editar' : 'Consultar';

    if (this.operacao == 'Consultar'){
      this.leitura = true;
    }

    this.criarFormulario();
    if (this.operacao != 'Novo') {
      this.erroCarregando = false;
      this.carregando = true;
      this.service.buscarPorId(id!).pipe(catchError(
        err => {
          this.erroCarregando = true;
          this.carregando = false;
          this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar o fornecedor!' });
          throw 'Erro ao recuperar o fornecedor! Detalhes: ' + err;
        })).subscribe((fornecedor) => {
          this.carregando = false;
          if (fornecedor != null) {
            this.inicial = fornecedor;
            console.log('inicial', this.inicial);
            this.criarFormulario();
          } else {
            this.alertas.push({ tipo: 'danger', mensagem: 'Fornecedor não encontrado!' });
            this.erroCarregando = true;
          }
        });
    }
  }

  salvar(): void {
    // Criação do fornecedor
    let fornecedor: Fornecedor = {
      nome: this.formulario.value.nome,
      tipo: this.formulario.value.tipo,
      identificacao: this.formulario.value.identificacao,
      endereco : {
        rua : this.formulario.value.rua,
        numero: this.formulario.value.numero,
        complemento: this.formulario.value.complemento
      }
    };

    this.salvandoFormulario(true);
    if (this.operacao == 'Novo') {
      this.cadastrarFornecedor(fornecedor);
    } else {
      fornecedor._id = this.inicial._id!;
      this.editarFornecedor(fornecedor);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Novo') || this.listar) {
        this.router.navigate(['/fornecedores']);
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
      identificacao: [{value: this.inicial.identificacao, disabled: this.readOnly()}, Validators.required],
      tipo: [{value: this.inicial.tipo, disabled: this.readOnly()}, Validators.required],
      rua: [{value: this.inicial.endereco.rua, disabled: this.readOnly()}, Validators.required],
      numero: [{value: this.inicial.endereco.numero, disabled: this.readOnly()}, Validators.required],
      complemento: [{value: this.inicial.endereco.complemento, disabled: this.readOnly()}],

    });
  }

  private cadastrarFornecedor(fornecedor: Fornecedor) {
    this.service.criar(fornecedor).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao cadastrar fornecedor!' });
        throw 'Erro ao cadastrar fornecedor. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Fornecedor "${fornecedor.nome}" cadastrado com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarFornecedor(fornecedor: Fornecedor) {
    this.salvandoFormulario(true);
    this.service.editar(fornecedor).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao editar fornecedor!' });
        throw 'Erro ao editar fornecedor. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/fornecedores'],  {state: {alerta: {tipo: 'success', mensagem: `Fornecedor "${fornecedor.nome}" salvo com sucesso!`} }});
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
}
