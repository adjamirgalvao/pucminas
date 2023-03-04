import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Vendedor } from 'src/app/interfaces/Vendedor';
import { VendedorService } from 'src/app/services/vendedor/vendedor.service';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-editar-vendedor',
  templateUrl: './editar-vendedor.component.html',
  styleUrls: ['./editar-vendedor.component.css']
})
export class EditarVendedorComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: VendedorService,
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

  inicial: Vendedor = {
    nome: '',
    cpf: '',
    salario: 0,
    email: '',
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
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Vendedor não encontrado!' });
            this.leitura = true;
            this.criarFormulario();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar o vendedor! Detalhes: ${err.error}` });
          }
          throw 'Erro ao recuperar o vendedor! Detalhes: ' + err.error;
        })).subscribe((vendedor) => {
          this.carregando = false;
          if (vendedor != null) {
            this.inicial = vendedor;
            console.log('inicial', this.inicial);
            this.criarFormulario();
            this.setFocusInicial();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Vendedor não encontrado!' });
            this.erroCarregando = true;
          }
        });
    }
  }

  salvar(): void {
    // Criação do vendedor
    let vendedor: Vendedor = {
      nome: this.formulario.value.nome,
      cpf: this.formulario.value.cpf,
      salario: this.formulario.value.salario,
      email: this.formulario.value.email,
      endereco : {
        rua : this.formulario.value.rua,
        numero: this.formulario.value.numero,
        complemento: this.formulario.value.complemento
      }
    };

    this.salvandoFormulario(true);
    if (this.operacao == 'Novo') {
      this.cadastrarVendedor(vendedor);
    } else {
      vendedor._id = this.inicial._id!;
      this.editarVendedor(vendedor);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Novo') || this.listar) {
        this.router.navigate(['/vendedores']);
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
      email: [{value: this.inicial.email, disabled: this.readOnly()}, Validators.compose([
        Validators.required,
        Validators.email])],
      salario: [{value: this.inicial.salario, disabled: this.readOnly()}, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])],
      rua: [{value: this.inicial.endereco.rua, disabled: this.readOnly()}, Validators.required],
      numero: [{value: this.inicial.endereco.numero, disabled: this.readOnly()}, Validators.required],
      complemento: [{value: this.inicial.endereco.complemento, disabled: this.readOnly()}],

    });
  }

  private cadastrarVendedor(vendedor: Vendedor) {
    this.service.criar(vendedor).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao cadastrar vendedor! Detalhes: ${err.error?.error}` });
        throw 'Erro ao cadastrar vendedor. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = [];
          this.adicionarAlerta({ tipo: 'success', mensagem: `Vendedor "${vendedor.nome}" cadastrado com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
          this.setFocusInicial();
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarVendedor(vendedor: Vendedor) {
    this.salvandoFormulario(true);
    this.service.editar(vendedor).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao editar vendedor! Detalhes: ${err.error?.error}` });
        throw 'Erro ao editar vendedor. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/vendedores'],  {state: {alerta: {tipo: 'success', mensagem: `Vendedor "${vendedor.nome}" salvo com sucesso!`} }});
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
    if (!this.alertas.find(a => a.tipo === alerta.tipo && a.mensagem === alerta.mensagem)) {
      this.alertas.push(alerta);
    }
    /*setTimeout(()=> {
      if (this.alertas.indexOf(alerta) > -1) {
         this.alertas.splice(this.alertas.indexOf(alerta), 1);
      }
    }, 5000);*/

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
