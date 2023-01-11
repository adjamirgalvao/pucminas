import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//para usar reactiveform
import { ReactiveFormsModule } from '@angular/forms';
//client http
import { HttpClientModule} from '@angular/common/http';
// Animações 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//material io
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
// Meus componentes
import { CabecalhoComponent } from './componentes/cabecalho/cabecalho.component';
import { CriarProdutoComponent } from './componentes/produtos/criar-produto/criar-produto.component';
import { HomeComponent } from './componentes/home/home/home.component';
import { AlertaComponent } from './componentes/util/alerta/alerta.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { EditarProdutoComponent } from './componentes/produtos/editar-produto/editar-produto.component';

@NgModule({
  declarations: [
    AppComponent,
    CabecalhoComponent,
    CriarProdutoComponent,
    HomeComponent,
    AlertaComponent,
    ListarProdutosComponent,
    EditarProdutoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatSortModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
