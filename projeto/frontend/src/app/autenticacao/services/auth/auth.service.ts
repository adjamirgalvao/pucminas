import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioToken } from 'src/app/interfaces/UsuarioToken';
import { TokenService } from '../token/token.service';

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

  getUsuario() {
    return this.tokenService.getUsuario();
  }  
}  
