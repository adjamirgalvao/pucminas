import { Component } from '@angular/core';
import { AuthService } from 'src/app/autenticacao/services/auth/auth.service';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.css']
})
export class CabecalhoComponent {

  constructor(
    public authService: AuthService){
 }
  //Resolvendo o problema do toogle no angular https://www.youtube.com/watch?v=m5fdwxB-jIM
  public isCollapsed : boolean = true;

    
}
