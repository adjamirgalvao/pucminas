import { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { Usuario } from 'src/app/interfaces/Usuario';
import { Token } from 'src/app/interfaces/Token';
import { TokenService } from '../token/token.service';

export const ADMIN = 'ADMINISTRADOR';
export const VENDEDOR = 'VENDEDOR';
export const ESTOQUE = 'ESTOQUE';
export const CLIENTE = 'CLIENTE';
export const GESTOR = 'GESTOR';
export const GOOGLE_CLIENT_ID = '29293112369-dsdrjt1o361s0oajmoiqsjcjcqes7o0v.apps.googleusercontent.com';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  private readonly API_AUTENTICACAO = '/api/autenticacao/';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,) { 

  }

  loginJwt(usuario: Usuario){
    return this.http.post<Token>(this.API_AUTENTICACAO + 'login', usuario).pipe(tap(
      res => {
          this.tokenService.setToken(res);
          return res;
    }));
  }

  
  loginGoogle(usuario: SocialUser){
    return this.http.post<Token>(this.API_AUTENTICACAO + 'loginGoogle', usuario).pipe(tap(
      res => {
          this.tokenService.setToken(res);
          return res;
    }));
  }

  logout() {
    this.tokenService.removeToken();
  }

  isLogado() {
    return this.tokenService.hasToken();
  }

  isTokenExpirado() {
    return this.tokenService.isTokenExpired();
  }

  getUsuario(): Usuario {
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


  isGestor() : boolean{
    let retorno = false;

    if (this.isLogado()) {
      let usuario = this.getUsuario();

      if (usuario && usuario.roles) {
        retorno = (usuario.roles.indexOf(GESTOR) > -1);
      }
    }

    return retorno;
  }

  validarRoles(roles: any): boolean {
    let  retorno = false;

    if (roles && roles.length > 0) {
      let usuario = this.getUsuario();

      if (usuario && usuario.roles) {
        for (let i in roles) {
           retorno = retorno || usuario.roles.indexOf(roles[i]) > -1; 
        } 
      }   
    }  

    return retorno;
}

}  
