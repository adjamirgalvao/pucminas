import { IndicadoresComponent } from './componentes/graficos/indicadores/indicadores.component';
import { LogoutComponent } from './componentes/autenticacao/logout/logout.component';
import { NotfoundComponent } from './componentes/util/notfound/notfound.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { EditarProdutoComponent } from './componentes/produtos/editar-produto/editar-produto.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { CriarCompraProdutoComponent } from './componentes/produtos/comprasProduto/criar-compra-produto/criar-compra-produto.component';
import { ListarComprasProdutoComponent } from './componentes/produtos/comprasProduto/listar-compras-produto/listar-compras-produto.component';
import { ListarFornecedoresComponent } from './componentes/fornecedores/listar-fornecedores/listar-fornecedores.component';
import { EditarFornecedorComponent } from './componentes/fornecedores/editar-fornecedor/editar-fornecedor.component';
import { ListarComprasComponent } from './componentes/compras/listar-compras/listar-compras.component';
import { EditarCompraComponent } from './componentes/compras/editar-compra/editar-compra.component';
import { ListarClientesComponent } from './componentes/clientes/listar-clientes/listar-clientes.component';
import { EditarClienteComponent } from './componentes/clientes/editar-cliente/editar-cliente.component';
import { ListarVendedoresComponent } from './componentes/vendedores/listar-vendedores/listar-vendedores.component';
import { EditarVendedorComponent } from './componentes/vendedores/editar-vendedor/editar-vendedor.component';
import { ListarVendasComponent } from './componentes/vendas/listar-vendas/listar-vendas.component';
import { EditarVendaComponent } from './componentes/vendas/editar-venda/editar-venda.component';
import { AuthGuard } from './services/autenticacao/auth/auth-guard.service';
import { ESTOQUE, MASTER, VENDEDOR, ADMIN } from './services/autenticacao/auth/auth.service';
import { LoginComponent } from './componentes/autenticacao/login/login.component';
import { ListarUsuariosComponent } from './componentes/usuarios/listar-usuarios/listar-usuarios.component';
import { EditarUsuarioComponent } from './componentes/usuarios/editar-usuario/editar-usuario.component';

//https://stackoverflow.com/questions/50624086/how-to-pass-parameters-to-constructor-of-canactivate
  
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch : 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent //se quer ir para a página de login o sistema já faz o logout
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
  {
    path: 'registrar',
    component: EditarUsuarioComponent, 
  },
  {
    path: 'atualizarPerfil',
    component: EditarUsuarioComponent, 
  },
  {
    path: 'usuarios',
    component: ListarUsuariosComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]}
  },
  {
    path: 'usuarios/criarUsuario',
    component: EditarUsuarioComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]}
  },
  {
    path: 'usuarios/:id',
    component: EditarUsuarioComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]} 
  },
  {
    path: 'usuarios/:id/editarUsuario',
    component: EditarUsuarioComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]} 
  },
  {
    path: 'produtos',
    component: ListarProdutosComponent,
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },
  {
    path: 'produtos/criarProduto',
    component: EditarProdutoComponent,
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },
   // https://stackoverflow.com/questions/67106539/angular-routing-param-in-the-middle
  {
    path: 'produtos/:id',
    component: EditarProdutoComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },
  {
    path: 'produtos/:id/editarProduto',
    component: EditarProdutoComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]} 
  },
  {
    path: 'produtos/:id/cadastrarCompraProduto',
    component: CriarCompraProdutoComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },  
  {
    path: 'produtos/:id/listarComprasProduto',
    component: ListarComprasProdutoComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },  
  {
    path: 'fornecedores',
    component: ListarFornecedoresComponent,
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },
  {
    path: 'fornecedores/criarFornecedor',
    component: EditarFornecedorComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },
  {
    path: 'fornecedores/:id',
    component: EditarFornecedorComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]} 
  },
  {
    path: 'fornecedores/:id/editarFornecedor',
    component: EditarFornecedorComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]} 
  },
  {
    path: 'clientes',
    component: ListarClientesComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, VENDEDOR]}
  },
  {
    path: 'clientes/criarCliente',
    component: EditarClienteComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, VENDEDOR]}
  },
  {
    path: 'clientes/:id',
    component: EditarClienteComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, VENDEDOR]} 
  },
  {
    path: 'clientes/:id/editarCliente',
    component: EditarClienteComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, VENDEDOR]} 
  },
  {
    path: 'vendedores',
    component: ListarVendedoresComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]}
  },
  {
    path: 'vendedores/criarVendedor',
    component: EditarVendedorComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]}
  },
  {
    path: 'vendedores/:id',
    component: EditarVendedorComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]} 
  },
  {
    path: 'vendedores/:id/editarVendedor',
    component: EditarVendedorComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ADMIN]} 
  },
  {
    path: 'compras',
    component: ListarComprasComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },
  {
    path: 'compras/criarCompra',
    component: EditarCompraComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]}
  },
  {
    path: 'compras/:id',
    component: EditarCompraComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, ESTOQUE]} 
  },
  {
    path: 'vendas',
    component: ListarVendasComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, VENDEDOR]}
  },
  {
    path: 'vendas/criarVenda',
    component: EditarVendaComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, VENDEDOR]}
  },
  {
    path: 'vendas/:id',
    component: EditarVendaComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER, VENDEDOR]} 
  },
  {
    path: 'indicadoresCustosRentabilidade',
    component: IndicadoresComponent, 
    canActivate: [AuthGuard],
    data: {roles: [MASTER]} 
  },  
  {
     path: '404', 
    component: NotfoundComponent
  },
  {
    path: '**', 
    redirectTo: '/404'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
