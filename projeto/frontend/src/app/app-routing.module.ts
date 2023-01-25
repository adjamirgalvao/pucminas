import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home/home.component';
import { EdicaoProdutoComponent } from './componentes/produtos/edicao-produto/edicao-produto.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { CriarCompraProdutoComponent } from './componentes/produtos/comprasProduto/criar-compra-produto/criar-compra-produto.component';
import { ListarComprasProdutoComponent } from './componentes/produtos/comprasProduto/listar-compras-produto/listar-compras-produto.component';
import { ListarFornecedoresComponent } from './componentes/fornecedores/listar-fornecedores/listar-fornecedores.component';
import { EdicaoFornecedorComponent } from './componentes/fornecedores/edicao-fornecedor/edicao-fornecedor.component';
import { ListarComprasComponent } from './componentes/compras/listar-compras/listar-compras.component';
import { EdicaoCompraComponent } from './componentes/compras/edicao-compra/edicao-compra/edicao-compra.component';

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
    component: EdicaoProdutoComponent,
  },
   // https://stackoverflow.com/questions/67106539/angular-routing-param-in-the-middle
  {
    path: 'produtos/:id',
    component: EdicaoProdutoComponent 
  },
  {
    path: 'produtos/:id/editarProduto',
    component: EdicaoProdutoComponent 
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
    component: EdicaoFornecedorComponent,
  },
  {
    path: 'fornecedores/:id',
    component: EdicaoFornecedorComponent 
  },
  {
    path: 'fornecedores/:id/editarFornecedor',
    component: EdicaoFornecedorComponent 
  },
  {
    path: 'compras',
    component: ListarComprasComponent,
  },
  {
    path: 'compras/criarCompra',
    component: EdicaoCompraComponent,
  },
  {
    path: 'compras/:id',
    component: EdicaoCompraComponent 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
