import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { AuthService } from 'src/app/services/autenticacao/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Usuario } from 'src/app/interfaces/Usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private jwtAuthService: AuthService,
    private socialAuthService: SocialAuthService,
    private router: Router) {
    // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
    // não pode ficar no OnInit 
    let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
    if (alerta) {
      this.alertas.push(alerta);
    }
  }
  formulario!: FormGroup;

  alertas: Alerta[] = [];
  logando: boolean = false;

  ngOnInit(): void {
    this.criarFormulario();
    this.socialAuthService.authState.subscribe((user) => {
      //this.user = user;
      //this.loggedIn = (user != null);
      console.log('logado google', user);
      if (user) {
        this.logandoFormulario(true);
        this.logarGoogle(user);
      }
    });
  }

  login(): void {
    // Efetuando o login
    const usuario: Usuario = {
      login: this.formulario.value.login,
      senha: this.formulario.value.senha,
    };

    this.logandoFormulario(true);
    this.logarJwt(usuario);
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    this.formulario = this.formBuilder.group({
      login: [{ value: '', disabled: this.readOnly() }, Validators.required],
      senha: [{ value: '', disabled: this.readOnly() }, Validators.required],
    });
  }

  private logarGoogle(usuario: SocialUser) {
    this.jwtAuthService.loginGoogle(usuario).pipe(catchError(
      err => {
        this.logandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: `${err.error?.error}` });
        throw 'Erro ao efetuar login. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.logandoFormulario(false);
          this.alertas = [];
          this.router.navigate(['/home']);
        });
  }

  private logarJwt(usuario: Usuario) {
    this.jwtAuthService.loginJwt(usuario).pipe(catchError(
      err => {
        this.logandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: `${err.error?.error}` });
        throw 'Erro ao efetuar login. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.logandoFormulario(false);
          this.alertas = [];
          this.router.navigate(['/home']);
        });
  }

  readOnly() {
    return this.logando;
  }

  private logandoFormulario(logando: boolean) {
    this.logando = logando;
    if (logando) {
      this.formulario.disable();
    } else {
      this.formulario.enable();
    }
  }

}

