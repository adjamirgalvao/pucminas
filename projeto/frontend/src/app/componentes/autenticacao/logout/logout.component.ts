import { AuthService } from 'src/app/services/autenticacao/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit{
  constructor(
    private socialAuthService: SocialAuthService,
    private authService : AuthService,
    private router: Router
  ) {}
  
  logadoGoogle = false;

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((user) => {
      this.logadoGoogle = (user != null);
    });    

    this.authService.logout();
    if (this.logadoGoogle){
      this.socialAuthService.signOut();
    }  

    this.router.navigate(['/home']);
  }


}
