import { Injectable } from '@angular/core';
import { Token } from 'src/app/interfaces/Token';
import jwt_decode from "jwt-decode";

const KEY = 'authToken';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor() { }

  hasToken() {
    return !!this.getToken();
  }

  //https://www.bezkoder.com/logout-when-token-expired-angular-14/
  isTokenExpired() {
    let expirou = false;
    let expires = this.getExpires();


    if (expires) {
      expirou = parseInt(expires) * 1000 < Date.now();
      if (expirou) {
        this.removeToken();
      }
    }

    return expirou;
  }

  decodeToken(token: string) : any {
    return jwt_decode(token);
  }

  setToken(usuarioToken: Token) {
    window.localStorage.setItem(KEY, usuarioToken.token);
  }

  getToken() {
    return window.localStorage.getItem(KEY);
  }

  getUsuario() {
    let token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken.usuario;
    } else {
      return null;
    }
  }

  getExpires() {
    let token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken.exp;
    } else {
      return null;
    }
  }

  removeToken() {
    window.localStorage.removeItem(KEY);
  }
}
