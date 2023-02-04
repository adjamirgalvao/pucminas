import { Component } from '@angular/core';
import { UsuarioAutenticadoService } from 'src/app/autenticacao/services/usuario-autenticado/usuario-autenticado.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private usuarioAutenticadoService: UsuarioAutenticadoService){
 }
  usuarioLogado(): boolean {
    return this.usuarioAutenticadoService.isLogado();
  }
}
