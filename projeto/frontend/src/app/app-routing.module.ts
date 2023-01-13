import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home/home.component';
import { CriarProdutoComponent } from './componentes/produtos/criar-produto/criar-produto.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { EditarProdutoComponent } from './componentes/produtos/editar-produto/editar-produto.component';
import { CriarCompraProdutoComponent } from './componentes/produtos/comprasProduto/criar-compra-produto/criar-compra-produto.component';
import { ListarComprasProdutoComponent } from './componentes/produtos/comprasProduto/listar-compras-produto/listar-compras-produto.component';

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
    path: 'produtos/criarProduto',
    component: CriarProdutoComponent
  },
  {
    path: 'produtos',
    component: ListarProdutosComponent
  },
  // https://stackoverflow.com/questions/67106539/angular-routing-param-in-the-middle
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

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
