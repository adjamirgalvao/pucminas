import { TokenService } from '../services/token/token.service';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable()
//https://blog.angular-university.io/angular-jwt-authentication/
//https://github.com/bezkoder/angular-15-refresh-token/blob/master/src/app/_helpers/http.interceptor.ts aqui como fazer no angular 15 o interceptor
export class HttpRequestInterceptor implements HttpInterceptor {
 
  constructor(
    private tokenService : TokenService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();
    let requisicao = req;
    if (token) {
      requisicao = req.clone({headers: req.headers.set("Authorization","Bearer " + token)});
    }
    return next.handle(requisicao).pipe(
            catchError((error) => {
              //https://stackoverflow.com/questions/64110465/redirect-and-cancel-request-using-interceptor-when-httpstatus-is-202
              if (error instanceof HttpErrorResponse && !req.url.includes('api/login')) {
                 if (error.status === 401) {
                    this.tokenService.removeToken();
                    this.router.navigate(['/login'], {state: {alerta: {tipo: 'danger', mensagem: `Usuário não está logado. Efetue o login!`} }});
                    throw new Error('Precisa autenticar');
                 } else if (error.status === 403) {
                    this.router.navigate(['/home'], {state: {alerta: {tipo: 'danger', mensagem: `Usuário não possui permissão! `} }});
                    throw new Error('Sem permissão');
               }   
              }
      
              return throwError(() => error);
            })
          );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];