import { Component } from '@angular/core';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.css']
})
export class CabecalhoComponent {

  //Resolvendo o problema do toogle no angular https://www.youtube.com/watch?v=m5fdwxB-jIM
  public isCollapsed : boolean = true;

}
