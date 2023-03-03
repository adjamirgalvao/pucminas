import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioService } from 'src/app/services/usuario/usuario.service';
import { Location } from '@angular/common';
import { ADMIN, GESTOR, ESTOQUE, VENDEDOR, CLIENTE, AuthService } from 'src/app/services/autenticacao/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css']
})
export class EditarUsuarioComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: UsuarioService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let modo = this.router.getCurrentNavigation()?.extras.state?.['operacao'];
      if (modo) {
         this.operacao = modo;
      }
      // https://stackoverflow.com/questions/45184969/get-current-url-in-angular
      if (this.router.url.indexOf('/registrar') > -1) {
        this.operacao = 'Registrar';
      }
      if (this.router.url.indexOf('/atualizarPerfil') > -1) {
        this.operacao = 'Atualizar Perfil do';
      }
    }
  formulario!: FormGroup;

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;
  leitura: boolean = false;

  rolesDisponiveis: string[] = [ADMIN, GESTOR, ESTOQUE, VENDEDOR, CLIENTE];

  inicial: Usuario = {
    nome: '',
    login: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    roles: [],
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
    let id = this.route.snapshot.paramMap.get('id');

    if (this.operacao == 'Atualizar Perfil do') {
      id = this.authService.getUsuario()._id!;
    }

    console.log('id ', id);
    if (!this.operacao) {
      this.operacao = (id == null) ? 'Novo' : this.router.url.indexOf('editar') > 0 ? 'Editar' : 'Detalhar';
    }

    if (this.operacao == 'Detalhar'){
      this.leitura = true;
    }

    this.criarFormulario();
    if ((this.operacao == 'Detalhar') || (this.operacao == 'Editar') || (this.operacao == 'Atualizar Perfil do')){
      this.erroCarregando = false;
      this.carregando = true;
      this.service.buscarPorId(id!).pipe(catchError(
        (err: HttpErrorResponse)  => {
          this.erroCarregando = true;
          this.carregando = false;
          if (err.status == 404) {
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Usuário não encontrado!' });
            this.leitura = true;
            this.criarFormulario();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar o usuário! Detalhes: ${err.error}` });
          }  
          throw 'Erro ao recuperar o usuário! Detalhes: ' + err.error;
        })).subscribe((usuario) => {
          this.carregando = false;
          if (usuario != null) {
            this.inicial = usuario;
            console.log('inicial', this.inicial);
            this.criarFormulario();
            this.setFocusInicial();
          } else {
            this.adicionarAlerta({ tipo: 'danger', mensagem: 'Usuário não encontrado!' });
            this.erroCarregando = true;
          }
        });
    }
  }

  salvar(): void {
    // Criação do usuario
    let usuario: Usuario = {
      nome: this.formulario.value.nome,
      login: this.formulario.value.login,
      email: this.formulario.value.email,
      senha: this.formulario.value.senha,
    };

    if (this.operacao != 'Atualizar Perfil do'){
      if (this.operacao != 'Registrar') {
        usuario.roles = this.formulario.value.roles;
      }
    }
    
    if (this.formulario.value.senha.length > 0){
      usuario.senha = this.formulario.value.senha;
    }

    this.salvandoFormulario(true);
    if ((this.operacao != 'Editar') && (this.operacao != 'Atualizar Perfil do')) {
      this.cadastrarUsuario(usuario);
    } else {
      usuario._id = this.inicial._id!;
      console.log('editar', usuario);
      this.editarUsuario(usuario);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if (((this.operacao != 'Novo') && (this.operacao != 'Atualizar Perfil do') && (this.operacao != 'Registrar')) || this.listar) {
        this.router.navigate(['/usuarios']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }    
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    if ((this.operacao == 'Editar') || (this.operacao == 'Atualizar Perfil do')) {
      this.formulario = this.formBuilder.group({
        nome: [{value: this.inicial.nome, disabled: this.readOnly()}, Validators.compose([
          Validators.required,
          Validators.pattern(/(.|\s)*\S(.|\s)*/)
        ])],
        email: [{value: this.inicial.email, disabled: this.readOnly()}, Validators.compose([
          Validators.required,
          Validators.email])],
        login: [{value: this.inicial.login, disabled: true}, Validators.required],
        senha: [{value: '', disabled: this.readOnly()}, Validators.compose([
          Validators.pattern(/(.|\s)*\S(.|\s)*/),
        ])],
        confirmacaoSenha: [{value: '', disabled: this.readOnly()}, Validators.compose([
          Validators.pattern(/(.|\s)*\S(.|\s)*/),
        ])],
        roles: [{value: this.inicial.roles, disabled: this.readOnly()}, Validators.required],
      }, { validator: this.senhaValidator } as AbstractControlOptions);
    } else if ((this.operacao == 'Novo') || (this.operacao == 'Detalhar')) {
       this.formulario = this.formBuilder.group({
          nome: [{value: this.inicial.nome, disabled: this.readOnly()}, Validators.compose([
            Validators.required,
            Validators.pattern(/(.|\s)*\S(.|\s)*/)
         ])],
         email: [{value: this.inicial.email, disabled: this.readOnly()}, Validators.compose([
           Validators.required,
           Validators.email])],
         login: [{value: this.inicial.login, disabled: this.readOnly()}, Validators.required],
         senha: [{value: '', disabled: this.readOnly()},  Validators.compose([
          Validators.required,
          Validators.pattern(/(.|\s)*\S(.|\s)*/),
        ])],
         confirmacaoSenha: [{value: '', disabled: this.readOnly()},  Validators.compose([
          Validators.required,
          Validators.pattern(/(.|\s)*\S(.|\s)*/),
        ])],
         roles: [{value: this.inicial.roles, disabled: this.readOnly()}, Validators.required],
        }, { validator: this.senhaValidator } as AbstractControlOptions);
    } else {
      this.formulario = this.formBuilder.group({
        nome: [{value: this.inicial.nome, disabled: this.readOnly()}, Validators.compose([
          Validators.required,
          Validators.pattern(/(.|\s)*\S(.|\s)*/)
       ])],
       email: [{value: this.inicial.email, disabled: this.readOnly()}, Validators.compose([
         Validators.required,
         Validators.email])],
       login: [{value: this.inicial.login, disabled: this.readOnly()}, Validators.required],
       senha: [{value: '', disabled: this.readOnly()},  Validators.compose([
        Validators.required,
        Validators.pattern(/(.|\s)*\S(.|\s)*/),
      ])],
       confirmacaoSenha: [{value: '', disabled: this.readOnly()},  Validators.compose([
        Validators.required,
        Validators.pattern(/(.|\s)*\S(.|\s)*/),
      ])],
      }, { validator: this.senhaValidator } as AbstractControlOptions);      
    }
  }

  // https://stackoverflow.com/questions/46181312/angular-form-validation-compare-two-fields
  senhaValidator(c: AbstractControl) {
    //safety check
    if (!c.get('senha')?.value && !c.get('confirmacaoSenha')?.value) { 
      c.get('confirmacaoSenha')?.setErrors(null);
      return null; 
    } else if (!c.get('senha')?.value != !c.get('confirmacaoSenha')?.value) { 
      c.get('confirmacaoSenha')?.setErrors({confirmacao: true});
      return {'confirmacao': true} ;
    } else if (c.get('senha')?.value != c.get('confirmacaoSenha')?.value) {
      c.get('confirmacaoSenha')?.setErrors({confirmacao: true});
      return {'confirmacao': true} ;
    } else {
      c.get('confirmacaoSenha')?.setErrors(null);
      return null;
    }
  }

  private cadastrarUsuario(usuario: Usuario) {
    this.service.criar(usuario, this.operacao).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao cadastrar usuário! Detalhes: ${err.error?.error}` });
        throw 'Erro ao cadastrar usuário. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          if (this.operacao != 'Registrar') {
            this.salvandoFormulario(false);
            this.alertas = [];
            this.adicionarAlerta({ tipo: 'success', mensagem: `Usuário "${usuario.nome}" cadastrado com sucesso!` });
            //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
            this.formDirective.resetForm(this.inicial);
            this.setFocusInicial();
          } else {
            this.router.navigate(['/home'],  {state: {alerta: {tipo: 'success', mensagem: `Usuário "${usuario.nome}" registrado com sucesso! Efetue o login.`} }});
          }  
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarUsuario(usuario: Usuario) {
    this.salvandoFormulario(true);
    this.service.editar(usuario).pipe(catchError(
      (err: HttpErrorResponse) => {
        this.salvandoFormulario(false);
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao editar usuário! Detalhes: ${err.error?.error}` });
        throw 'Erro ao editar usuário. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          let alerta = {tipo: 'success', mensagem: `Usuário "${usuario.nome}" salvo com sucesso!`};
          this.salvandoFormulario(false);
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          if (this.operacao == 'Editar') {
            this.router.navigate(['/usuarios'],  {state: { alerta }});
          } else {
            // Como estes campos não estão habilitados eles vem como undefined na hora de salvar o formulário
            usuario.login = this.inicial.login;
            usuario.roles = this.inicial.roles;
            //Atualizo o token local para mostrar o usuário logado corretamente.
            this.authService.setUsuario(usuario);
            this.router.navigate(['/home'],  {state: { alerta }});
          }
        });
  }

  private salvandoFormulario(salvando: boolean){
    this.salvando = salvando;
    if (salvando) {
      this.formulario.disable();
    } else {
      this.formulario.enable();
      if ((this.operacao == 'Editar') || (this.operacao == 'Atualizar Perfil do')) {
        this.formulario.get('login')?.disable();
      }
    }
  }
   
  public adicionarAlerta(alerta: any){
    if (!this.alertas.find(a => a.tipo === alerta.tipo && a.mensagem === alerta.mensagem)) {
      this.alertas.push(alerta);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
