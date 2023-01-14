import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// Para usar reactiveform
import { ReactiveFormsModule } from '@angular/forms';
// Client http
import { HttpClientModule} from '@angular/common/http';
// Animações 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Material io
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
// Meus componentes
import { CabecalhoComponent } from './componentes/cabecalho/cabecalho.component';
import { EdicaoProdutoComponent } from './componentes/produtos/edicao-produto/edicao-produto.component';
import { HomeComponent } from './componentes/home/home/home.component';
import { AlertaComponent } from './componentes/util/alerta/alerta.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { ModalConfirmacaoComponent } from './componentes/util/modal-confirmacao/modal-confirmacao.component';
import { CriarCompraProdutoComponent } from './componentes/produtos/comprasProduto/criar-compra-produto/criar-compra-produto.component';
import { ListarComprasProdutoComponent } from './componentes/produtos/comprasProduto/listar-compras-produto/listar-compras-produto.component';

@NgModule({
  declarations: [
    AppComponent,
    CabecalhoComponent,
    EdicaoProdutoComponent,
    HomeComponent,
    AlertaComponent,
    ListarProdutosComponent,
    ModalConfirmacaoComponent,
    CriarCompraProdutoComponent,
    ListarComprasProdutoComponent
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
    MatSortModule,
    MatDialogModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
