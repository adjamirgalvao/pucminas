import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home/home.component';
import { CriarProdutoComponent } from './componentes/produtos/criar-produto/criar-produto.component';
import { ListarProdutosComponent } from './componentes/produtos/listar-produtos/listar-produtos.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch : 'full'
  },  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'criarProduto',
    component: CriarProdutoComponent
  },
  {
    path: 'listarProdutos',
    component: ListarProdutosComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
