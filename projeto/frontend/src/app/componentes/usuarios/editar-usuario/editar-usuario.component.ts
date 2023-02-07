import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioService } from 'src/app/services/usuario/usuario.service';
import { Location } from '@angular/common';
import { ADMIN, MASTER, ESTOQUE, VENDEDOR, CLIENTE } from 'src/app/services/autenticacao/auth/auth.service';

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

  rolesDisponiveis: string[] = [ADMIN, MASTER, ESTOQUE, VENDEDOR, CLIENTE];

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
  
  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    this.operacao = (id == null) ? 'Cadastrar' : this.router.url.indexOf('editar') > 0 ? 'Editar' : 'Consultar';

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
          this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar o usuário! Detalhes: ${err.error?.error}` });
          throw 'Erro ao recuperar o usuário! Detalhes: ' + err.error?.error;
        })).subscribe((usuario) => {
          this.carregando = false;
          if (usuario != null) {
            this.inicial = usuario;
            console.log('inicial', this.inicial);
            this.criarFormulario();
          } else {
            this.alertas.push({ tipo: 'danger', mensagem: 'Usuário não encontrado!' });
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
      roles: this.formulario.value.roles,
    };
    
    if (this.formulario.value.senha.length > 0){
      usuario.senha = this.formulario.value.senha;
    }

    this.salvandoFormulario(true);
    if (this.operacao == 'Cadastrar') {
      this.cadastrarUsuario(usuario);
    } else {
      usuario._id = this.inicial._id!;
      this.editarUsuario(usuario);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Cadastrar') || this.listar) {
        this.router.navigate(['/usuarios']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }    
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    if (this.operacao == 'Editar') {
      this.formulario = this.formBuilder.group({
        nome: [{value: this.inicial.nome, disabled: this.readOnly()}, Validators.compose([
          Validators.required,
          Validators.pattern(/(.|\s)*\S(.|\s)*/)
        ])],
        email: [{value: this.inicial.email, disabled: this.readOnly()}, Validators.compose([
          Validators.required,
          Validators.email])],
        login: [{value: this.inicial.login, disabled: true}, Validators.required],
        senha: [{value: '', disabled: this.readOnly()}, Validators.required],
        confirmacaoSenha: [{value: '', disabled: this.readOnly()}, Validators.required],
        roles: [{value: this.inicial.roles, disabled: this.readOnly()}, Validators.required],
    });
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
         senha: [{value: '', disabled: this.readOnly()}, Validators.required],
         confirmacaoSenha: [{value: '', disabled: this.readOnly()}, Validators.required],
         roles: [{value: this.inicial.roles, disabled: this.readOnly()}, Validators.required],
        });
    }
  }

  private cadastrarUsuario(usuario: Usuario) {
    this.service.criar(usuario).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao cadastrar usuário! Detalhes: ${err.error?.error}` });
        throw 'Erro ao cadastrar usuário. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Usuário "${usuario.nome}" cadastrado com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarUsuario(usuario: Usuario) {
    this.salvandoFormulario(true);
    this.service.editar(usuario).pipe(catchError(
      err => {
        this.salvandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao editar usuário! Detalhes: ${err.error?.error}` });
        throw 'Erro ao editar usuário. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.salvandoFormulario(false);
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/usuarios'],  {state: {alerta: {tipo: 'success', mensagem: `Usuário "${usuario.nome}" salvo com sucesso!`} }});
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
