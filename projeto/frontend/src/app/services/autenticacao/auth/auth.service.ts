import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioToken } from 'src/app/interfaces/UsuarioToken';
import { TokenService } from '../token/token.service';

export const ADMIN = 'ADMINISTRADOR';
export const VENDEDOR = 'VENDEDOR';
export const ESTOQUE = 'ESTOQUE';
export const CLIENTE = 'CLIENTE';
export const MASTER = 'MASTER';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  private readonly API_AUTENTICACAO = 'http://localhost:8090/api/autenticacao/login';



  constructor(
    private http: HttpClient,
    private tokenService: TokenService,) { 

  }

  login(usuario: Usuario){
    return this.http.post<UsuarioToken>(this.API_AUTENTICACAO, usuario).pipe(tap(
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
