import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home/home.component';
import { CriarProdutoComponent } from './componentes/produtos/criar-produto/criar-produto.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';
import { EditarProdutoComponent } from './componentes/produtos/editar-produto/editar-produto.component';
import { CriarCompraProdutoComponent } from './componentes/produtos/criar-compra-produto/criar-compra-produto.component';

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
    path: 'produtos/editarProduto/:id',
    component: EditarProdutoComponent
  },
  {
    path: 'produtos/cadastrarCompraProduto/:id',
    component: CriarCompraProdutoComponent
  },  {
    path: 'produtos/listarProdutos',
    component: ListarProdutosComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
