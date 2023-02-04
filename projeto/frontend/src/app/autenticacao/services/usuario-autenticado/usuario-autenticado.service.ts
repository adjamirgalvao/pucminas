import { Injectable } from '@angular/core';
import { TokenService } from '../token/token.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioAutenticadoService {

  constructor(
    private tokenService: TokenService,
  ) { }

  logout() {
    this.tokenService.removeToken();
  }

  isLogado() {
    return this.tokenService.hasToken();
  }
}
