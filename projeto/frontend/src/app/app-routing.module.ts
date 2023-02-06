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
    path: 'produtos',
    component: ListarProdutosComponent,
  },
  {
    path: 'produtos/criarProduto',
    component: EditarProdutoComponent,
  },
   // https://stackoverflow.com/questions/67106539/angular-routing-param-in-the-middle
  {
    path: 'produtos/:id',
    component: EditarProdutoComponent 
  },
  {
    path: 'produtos/:id/editarProduto',
    component: EditarProdutoComponent 
  },
  {
    path: 'produtos/:id/cadastrarCompraProduto',
    component: CriarCompraProdutoComponent
  },  
  {
    path: 'produtos/:id/listarComprasProduto',
    component: ListarComprasProdutoComponent
  },  
  {
    path: 'fornecedores',
    component: ListarFornecedoresComponent,
  },
  {
    path: 'fornecedores/criarFornecedor',
    component: EditarFornecedorComponent,
  },
  {
    path: 'fornecedores/:id',
    component: EditarFornecedorComponent 
  },
  {
    path: 'fornecedores/:id/editarFornecedor',
    component: EditarFornecedorComponent 
  },
  {
    path: 'clientes',
    component: ListarClientesComponent,
  },
  {
    path: 'clientes/criarCliente',
    component: EditarClienteComponent,
  },
  {
    path: 'clientes/:id',
    component: EditarClienteComponent 
  },
  {
    path: 'clientes/:id/editarCliente',
    component: EditarClienteComponent 
  },
  {
    path: 'vendedores',
    component: ListarVendedoresComponent,
  },
  {
    path: 'vendedores/criarVendedor',
    component: EditarVendedorComponent,
  },
  {
    path: 'vendedores/:id',
    component: EditarVendedorComponent 
  },
  {
    path: 'vendedores/:id/editarVendedor',
    component: EditarVendedorComponent 
  },
  {
    path: 'compras',
    component: ListarComprasComponent,
  },
  {
    path: 'compras/criarCompra',
    component: EditarCompraComponent,
  },
  {
    path: 'compras/:id',
    component: EditarCompraComponent 
  },
  {
    path: 'vendas',
    component: ListarVendasComponent,
  },
  {
    path: 'vendas/criarVenda',
    component: EditarVendaComponent,
  },
  {
    path: 'vendas/:id',
    component: EditarVendaComponent 
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
