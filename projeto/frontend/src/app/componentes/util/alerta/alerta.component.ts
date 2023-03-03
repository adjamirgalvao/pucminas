import { Component, Input, OnInit } from '@angular/core';
import { Alerta } from 'src/app/interfaces/Alerta';


@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.css']
})

export class AlertaComponent implements OnInit {
  ngOnInit(): void {
   
  }
  
  @Input()
  alertas: Set<Alerta>= new Set<Alerta>();


  fecharAlerta(alerta: Alerta): void {
    this.alertas.delete(alerta);
  }
}


