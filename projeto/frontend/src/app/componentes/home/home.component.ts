import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/autenticacao/auth/auth.service';
import { Alerta } from 'src/app/interfaces/Alerta';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  constructor(
    private router: Router,
    public authService: AuthService){
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let alerta = this.router.getCurrentNavigation()?.extras.state?.['alerta'];
      if (alerta) {
         this.adicionarAlerta(alerta);
      }
 }
  ngOnInit(): void {
    if (this.authService.isLogado() && this.authService.isTokenExpirado()){
      this.authService.logout();
      this.router.navigate(['/login'], {state: {alerta: {tipo: 'danger', mensagem: `Sessão expirada. Efetue o login!`} }});
    }
  }

 alertas: Set<Alerta> = new Set<Alerta>();
   
 public adicionarAlerta(alerta: any){
  let novoAlerta = new Alerta(alerta.tipo, alerta.mensagem);
  const alertaEncontrado = [...this.alertas].find(alerta => alerta.tipo === novoAlerta.tipo && alerta.mensagem === novoAlerta.mensagem);

  if (!alertaEncontrado){
  this.alertas.add(new Alerta(alerta.tipo, alerta.mensagem));
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
}
