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

  ngOnInit(): void {
    this.authService.logout();
    console.log('state', this.socialAuthService.authState);
    this.socialAuthService.signOut();
    this.router.navigate(['/home']);
  }


}
