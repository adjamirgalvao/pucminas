import { Component, Input, OnInit } from '@angular/core';
import { Alerta } from 'src/app/interfaces/alerta';


@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.css']
})

export class AlertaComponent implements OnInit {
  ngOnInit(): void {
   
  }
  
  @Input()
  alertas: Alerta[] = [];


  fecharAlerta(alerta: Alerta): void {
    this.alertas.splice(this.alertas.indexOf(alerta), 1);
  }
}


