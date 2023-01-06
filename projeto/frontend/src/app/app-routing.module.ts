import { HomeComponent } from './componentes/home/home/home.component';
import { CriarProdutoComponent } from './componentes/produtos/criar-produto/criar-produto.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
