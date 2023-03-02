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
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from './constantes/Mydata';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask} from 'ngx-mask';
import { MatListModule } from '@angular/material/list';
//Autenticacao google https://www.npmjs.com/package/@abacritt/angularx-social-login
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
// Meus componentes
import { ModalConfirmacaoComponent } from './componentes/util/modal-confirmacao/modal-confirmacao.component';
import { AlertaComponent } from './componentes/util/alerta/alerta.component';
import { DinheiroPipe } from './pipes/DinheiroPipe';
import { CabecalhoComponent } from './componentes/cabecalho/cabecalho.component';
import { HomeComponent } from './componentes/home/home.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { EditarProdutoComponent } from './componentes/produtos/editar-produto/editar-produto.component';
import { ListarComprasProdutoComponent } from './componentes/produtos/comprasProduto/listar-compras-produto/listar-compras-produto.component';
import { CriarCompraProdutoComponent } from './componentes/produtos/comprasProduto/criar-compra-produto/criar-compra-produto.component';
import { ListarFornecedoresComponent } from './componentes/fornecedores/listar-fornecedores/listar-fornecedores.component';
import { EditarFornecedorComponent } from './componentes/fornecedores/editar-fornecedor/editar-fornecedor.component';
import { ListarComprasComponent } from './componentes/compras/listar-compras/listar-compras.component';
import { EditarCompraComponent } from './componentes/compras/editar-compra/editar-compra.component';
import { NotfoundComponent } from './componentes/util/notfound/notfound.component';
import { ListarClientesComponent } from './componentes/clientes/listar-clientes/listar-clientes.component';
import { EditarClienteComponent } from './componentes/clientes/editar-cliente/editar-cliente.component';
import { CpfCnpjPipe } from './pipes/CpfCnpjPipe';
import { ListarVendedoresComponent } from './componentes/vendedores/listar-vendedores/listar-vendedores.component';
import { EditarVendedorComponent } from './componentes/vendedores/editar-vendedor/editar-vendedor.component';
import { ListarVendasComponent } from './componentes/vendas/listar-vendas/listar-vendas.component';
import { EditarVendaComponent } from './componentes/vendas/editar-venda/editar-venda.component';
import { httpInterceptorProviders } from './autenticacao/httpInterceptor/HttpRequestInterceptor';
import { LoginComponent } from './componentes/autenticacao/login/login.component';
import { LogoutComponent } from './componentes/autenticacao/logout/logout.component';
import { ListarUsuariosComponent } from './componentes/usuarios/listar-usuarios/listar-usuarios.component';
import { EditarUsuarioComponent } from './componentes/usuarios/editar-usuario/editar-usuario.component';
import { GOOGLE_CLIENT_ID } from './services/autenticacao/auth/auth.service';
import { NgChartsModule } from 'ng2-charts';
import { MatSelectModule } from '@angular/material/select';
import { IndicadoresVendasComponent } from './componentes/gestao/indicadores-vendas/indicadores-vendas.component';
import { IndicadoresEstoqueComponent } from './componentes/gestao/indicadores-estoque/indicadores-estoque.component';
import { ProdutosMaisVendidosComponent } from './componentes/gestao/produtos-mais-vendidos/produtos-mais-vendidos.component';
import { MyCustomPaginatorIntl } from './componentes/util/paginacao/MyCustomPaginatorIntl';
import { RodapeComponent } from './componentes/rodape/rodape.component';


registerLocaleData(localePt, 'pt-BR');
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
    EditarProdutoComponent,
    HomeComponent,
    AlertaComponent,
    ListarProdutosComponent,
    ModalConfirmacaoComponent,
    CriarCompraProdutoComponent,
    ListarComprasProdutoComponent,
    DinheiroPipe, 
    CpfCnpjPipe, // nem uso mais após o NgxMask
    ListarFornecedoresComponent,
    EditarFornecedorComponent,
    ListarComprasComponent,
    EditarCompraComponent,
    NotfoundComponent,
    ListarClientesComponent,
    EditarClienteComponent,
    ListarVendedoresComponent,
    EditarVendedorComponent,
    ListarVendasComponent,
    EditarVendaComponent,
    LoginComponent,
    LogoutComponent,
    ListarUsuariosComponent,
    EditarUsuarioComponent,
    IndicadoresVendasComponent,
    IndicadoresEstoqueComponent,
    ProdutosMaisVendidosComponent,
    RodapeComponent,
  ],
  imports: [
    CommonModule,
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
    MatRadioModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatListModule, 
    MatSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    SocialLoginModule,
    NgChartsModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl },

    httpInterceptorProviders, 
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
   // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    provideEnvironmentNgxMask(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(GOOGLE_CLIENT_ID)
          },
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }    
],
  bootstrap: [AppComponent]
})
export class AppModule { }
