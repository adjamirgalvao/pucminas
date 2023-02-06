import { AuthService } from 'src/app/autenticacao/services/auth/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
    private service: AuthService,
    private router: Router) {
    }
  formulario!: FormGroup;

  alertas: Alerta[] = [];
  logando: boolean = false;
  
  ngOnInit(): void {
    this.criarFormulario();
  }

  login(): void {
    // Efetuando o login
    const usuario: Usuario = {
      login: this.formulario.value.login,
      senha: this.formulario.value.senha,
    };

    this.logandoFormulario(true);
    this.logar(usuario);
  }

  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    this.formulario = this.formBuilder.group({
      login: [{value: '', disabled: this.readOnly()}, Validators.required],
      senha: [{value: '', disabled: this.readOnly()}, Validators.required],
    });
  }

  private logar(usuario: Usuario) {
    this.service.login(usuario).pipe(catchError(
      err => {
        this.logandoFormulario(false);
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao efetuar login: ${err.error?.error}` });
        throw 'Erro ao efetuar login. Detalhes: ' + err.error?.error;
      })).subscribe(
        () => {
          this.logandoFormulario(false);
         console.log('aqui no login');
          this.alertas = [];
          this.router.navigate(['/home']);
        });
  }

  readOnly(){
    return this.logando;
  }

  private logandoFormulario(logando: boolean){
    this.logando = logando;
    if (logando) {
      this.formulario.disable();
    } else {
      this.formulario.enable();
    }
  }

}

