import { UsuarioAutenticadoService } from './../../autenticacao/services/usuario-autenticado/usuario-autenticado.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.css']
})
export class CabecalhoComponent {

  constructor(
    private usuarioAutenticadoService: UsuarioAutenticadoService){
 }
  //Resolvendo o problema do toogle no angular https://www.youtube.com/watch?v=m5fdwxB-jIM
  public isCollapsed : boolean = true;

  usuarioLogado(): boolean {
    return true;
    return this.usuarioAutenticadoService.isLogado();
  }
    
}
