import { AuthService } from 'src/app/autenticacao/services/auth/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
            
            if (!this.authService.isLogado()){
                this.router.navigate(['login'], {state: {alerta: {tipo: 'danger', mensagem: `Usuário não está logado. Efetue o login!`} }})
                return false;
            } else if (!this.authService.validarRoles(route.data['roles'])){
                this.router.navigate(['home'], {state: {alerta: {tipo: 'danger', mensagem: 'Acesso negado.'}}});
                return false;
            }
            return true;
    }
}