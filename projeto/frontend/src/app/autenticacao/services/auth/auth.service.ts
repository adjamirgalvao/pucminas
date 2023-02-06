import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioToken } from 'src/app/interfaces/UsuarioToken';
import { TokenService } from '../token/token.service';

const ADMIN = 'ADMINISTRADOR';
const VENDEDOR = 'VENDEDOR';
const ESTOQUE = 'ESTOQUE';
const CLIENTE = 'CLIENTE';
const MASTER = 'MASTER';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private readonly API_USUARIO = 'http://localhost:8090/api/usuarios/login';



  constructor(
    private http: HttpClient,
    private tokenService: TokenService,) { 

  }

  login(usuario: Usuario){
    return this.http.post<UsuarioToken>(this.API_USUARIO, usuario).pipe(tap(
      res => {
          this.tokenService.setToken(res);
          console.log(res);
          console.log(res.usuario);
          console.log(res.token);
          return res;
    }));
  }

  logout() {
    this.tokenService.removeToken();
  }

  isLogado() {
    return this.tokenService.hasToken();
  }

  getUsuario(): any {
    return this.tokenService.getUsuario();
  }  

  isAdmin() : boolean{
    let retorno = false;

    if (this.isLogado()) {
      let usuario = this.getUsuario();

      if (usuario && usuario.roles) {
        retorno = (usuario.roles.indexOf(ADMIN) > -1);
      }
    }

    return retorno;
  }

  isVendedor() : boolean{
    let retorno = false;

    if (this.isLogado()) {
      let usuario = this.getUsuario();

      if (usuario && usuario.roles) {
        retorno = (usuario.roles.indexOf(VENDEDOR) > -1);
      }
    }

    return retorno;
  }

  isEstoque() : boolean{
    let retorno = false;

    if (this.isLogado()) {
      let usuario = this.getUsuario();

      if (usuario && usuario.roles) {
        retorno = (usuario.roles.indexOf(ESTOQUE) > -1);
      }
    }

    return retorno;
  }

  isCliente() : boolean{
    let retorno = false;

    if (this.isLogado()) {
      let usuario = this.getUsuario();

      if (usuario && usuario.roles) {
        retorno = (usuario.roles.indexOf(CLIENTE) > -1);
      }
    }

    return retorno;
  }


  isMaster() : boolean{
    let retorno = false;

    if (this.isLogado()) {
      let usuario = this.getUsuario();

      if (usuario && usuario.roles) {
        retorno = (usuario.roles.indexOf(MASTER) > -1);
      }
    }

    return retorno;
  }
}  
