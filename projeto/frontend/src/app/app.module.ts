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
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
// Meus componentes
import { ModalConfirmacaoComponent } from './componentes/util/modal-confirmacao/modal-confirmacao.component';
import { AlertaComponent } from './componentes/util/alerta/alerta.component';
import { DinheiroPipe } from './pipes/DinheiroPipe';
import { CabecalhoComponent } from './componentes/cabecalho/cabecalho.component';
import { HomeComponent } from './componentes/home/home/home.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { EdicaoProdutoComponent } from './componentes/produtos/edicao-produto/edicao-produto.component';
import { ListarComprasProdutoComponent } from './componentes/produtos/comprasProduto/listar-compras-produto/listar-compras-produto.component';
import { CriarCompraProdutoComponent } from './componentes/produtos/comprasProduto/criar-compra-produto/criar-compra-produto.component';
import { ListarFornecedoresComponent } from './componentes/fornecedores/listar-fornecedores/listar-fornecedores.component';
import { EdicaoFornecedorComponent } from './componentes/fornecedores/edicao-fornecedor/edicao-fornecedor/edicao-fornecedor.component';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: "."
};

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
    ListarComprasProdutoComponent,
    DinheiroPipe,
    ListarFornecedoresComponent,
    EdicaoFornecedorComponent
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
    CurrencyMaskModule,
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
    MatPaginatorModule,
    MatProgressBarModule,
    MatRadioModule
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
