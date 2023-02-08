import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioToken } from 'src/app/interfaces/UsuarioToken';

const KEY = 'authToken';
const USUARIO = 'usuario';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor() { }

  hasToken() {
    return !!this.getToken();
  }

  setUsuario(usuario: Usuario) {
    window.localStorage.setItem(USUARIO, JSON.stringify(usuario));  
  }  

  setToken(usuarioToken : UsuarioToken) {
    window.localStorage.setItem(KEY, usuarioToken.token);
    this.setUsuario(usuarioToken.usuario);  
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
    window.localStorage.removeItem(USUARIO);
  }
}
