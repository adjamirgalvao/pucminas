import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Loja On-line';
  isRouteReady = false;

  /* Assim faz que o rodapé só seja exibido após a rotar estar pronta */
  constructor(
    private activatedRoute: ActivatedRoute, 
    private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isRouteReady = true;
      }
    });
  }
}
