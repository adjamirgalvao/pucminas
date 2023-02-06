import { Injectable } from '@angular/core';
import { UsuarioToken } from 'src/app/interfaces/UsuarioToken';

const KEY = 'authToken';
const USUARIO = 'usuario';
const VENCIMENTO = 'vencimento';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  hasToken() {
    return !!this.getToken();
  }

  setToken(usuarioToken : UsuarioToken) {
    window.localStorage.setItem(KEY, usuarioToken.token);
    window.localStorage.setItem(USUARIO, JSON.stringify(usuarioToken.usuario));  
  }

  getToken() {
    return window.localStorage.getItem(KEY);
  }

  getUsuario() {
    let usuario = window.localStorage.getItem(USUARIO);
    if (usuario) {
      return JSON.parse(usuario);
    } else {
      return null;
    }  
  }

  removeToken() {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(VENCIMENTO);
    window.localStorage.removeItem(USUARIO);
  }
}
