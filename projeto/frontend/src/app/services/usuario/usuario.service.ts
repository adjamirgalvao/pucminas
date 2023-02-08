import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/interfaces/Usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly API_USUARIO = 'http://localhost:8090/api/usuarios/';

  constructor(private http: HttpClient) { 

  }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_USUARIO);
  }

  criar(usuario: Usuario, operacao: string): Observable<Usuario> {
    console.log(usuario);
    if (operacao == 'Cadastrar') {
      return this.http.post<Usuario>(this.API_USUARIO, usuario);
    } else {
      return this.http.post<Usuario>(this.API_USUARIO + '/registrar', usuario);
    }
  }

  buscarPorId(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(this.API_USUARIO + '' + id);
  }

  editar(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.API_USUARIO + '' + usuario._id, usuario);
  }
 
  excluir(usuario: Usuario): Observable<Usuario> {
    console.log(usuario);
    return this.http.delete<Usuario>(this.API_USUARIO + '' + usuario._id);
  }

}