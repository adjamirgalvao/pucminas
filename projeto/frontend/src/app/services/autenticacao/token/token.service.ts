import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/interfaces/Usuario';
import { UsuarioToken } from 'src/app/interfaces/UsuarioToken';

const KEY = 'authToken';
const USUARIO = 'usuario';
const EXPIRES = 'expires';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor() { }

  hasToken() {
    return !!this.getToken();
  }

  isTokenExpired() {
    let expirou = false;
    let expires = window.localStorage.getItem(EXPIRES);

    if (expires) {
      expirou = parseInt(expires) * 1000 < Date.now();
      console.log('validade', parseInt(expires) * 1000, Date.now(), expirou);
      if (expirou) {
        console.log('removetoken');
        this.removeToken();
      }
    }

    return expirou;
  }


  setUsuario(usuario: Usuario) {
    window.localStorage.setItem(USUARIO, JSON.stringify(usuario));
  }

  setToken(usuarioToken: UsuarioToken) {
    window.localStorage.setItem(KEY, usuarioToken.token);
    this.setUsuario(usuarioToken.usuario);
    const expiry = (JSON.parse(window.atob(usuarioToken.token.split('.')[1]))).exp;
    window.localStorage.setItem(EXPIRES, expiry);
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
    window.localStorage.removeItem(EXPIRES);
  }
}
