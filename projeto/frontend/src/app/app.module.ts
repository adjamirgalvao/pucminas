import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CabecalhoComponent } from './componentes/cabecalho/cabecalho.component';
import { CriarProdutoComponent } from './componentes/produtos/criar-produto/criar-produto.component';
import { HomeComponent } from './componentes/home/home/home.component';
import { AlertaComponent } from './componentes/util/alerta/alerta.component';
//para usar reactiveform
import { ReactiveFormsModule } from '@angular/forms';
//client http
import { HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    CabecalhoComponent,
    CriarProdutoComponent,
    HomeComponent,
    AlertaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
