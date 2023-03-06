import { Fornecedor } from 'src/app/interfaces/Fornecedor';
import { FornecedorService } from 'src/app/services/fornecedor/fornecedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';
import { Alerta } from 'src/app/interfaces/Alerta';
import { HttpErrorResponse } from '@angular/common/http';

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
        (err: HttpErrorResponse)  => {
          this.erroCarregando = true;
          this.carregando = false;
          if (err.status == 404) {
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Fornecedor não encontrado!' });
            this.leitura = true;
            this.criarFormulario();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar o fornecedor! Detalhes: ${err.error}` });
          }
          throw 'Erro ao recuperar o fornecedor! Detalhes: ' + err.error;
        })).subscribe((fornecedor) => {
          this.carregando = false;
          if (fornecedor != null) {
            this.inicial = fornecedor;
            console.log('inicial', this.inicial);
            this.criarFormulario();
            this.setFocusInicial();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Fornecedor não encontrado!' });
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

    // Desta forma a troca de tipo força a ter que digitar de novo o cnpj/cpf (da outra forma, mantendo o valor dava problema)
    this.formulario.get('tipo')?.valueChanges.subscribe(value => {
        let identificacao : string = this.formulario.get('identificacao')?.value + '';
        let limpar : boolean = false;
        switch (this.formulario.get('tipo')?.value) {
          case 'pj': 
            limpar = (identificacao.length != 14 );
            break;
          case 'pf': 
            limpar = (identificacao.length != 11 );
            break;
        }
        if (limpar) {
          this.formulario.get('identificacao')?.setValue('');
          this.formulario.get('identificacao')?.markAsUntouched();
        }
    });
  }

  private cadastrarFornecedor(fornecedor: Fornecedor) {
    this.service.criar(fornecedor).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao cadastrar fornecedor! Detalhes: ${err.error?.error}` });
        throw 'Erro ao cadastrar fornecedor. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = [];
          this.adicionarAlerta({ tipo: 'success', mensagem: `Fornecedor "${fornecedor.nome}" cadastrado com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
          this.setFocusInicial();
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
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao editar fornecedor! Detalhes: ${err.error?.error}` });
        throw 'Erro ao editar fornecedor. Detalhes: ' + err.error?.error;
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
   
  public getMascara(): string {
    if (this.formulario?.get('tipo')?.value == 'pf') {
      return "000.000.000-00";
    } else {
      return '00.000.000/0000-00';
    }
  } 

  public adicionarAlerta(alerta: any){
    if (!this.alertas.find(a => a.tipo === alerta.tipo && a.mensagem === alerta.mensagem)) {
      this.alertas.push(alerta);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
