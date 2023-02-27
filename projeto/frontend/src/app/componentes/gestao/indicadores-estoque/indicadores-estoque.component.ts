import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ChartType, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map, Observable, startWith } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Produto } from 'src/app/interfaces/Produto';
import { ProdutoService } from 'src/app/services/produto/produto.service';
import { CompraAgrupada } from 'src/app/interfaces/CompraAgrupada';

// https://valor-software.com/ng2-charts/#LineChart
@Component({
  selector: 'app-indicadores-estoque',
  templateUrl: './indicadores-estoque.component.html',
  styleUrls: ['./indicadores-estoque.component.css']
})
export class IndicadoresEstoqueComponent implements OnInit{
  constructor(
    private formBuilder: FormBuilder,
    private produtoService: ProdutoService,
  ) {
  }

  carregando: boolean = false;
  carregado: boolean = false;
  erroCarregando: boolean = false;
  alertas: Alerta[] = [];
  compras: CompraAgrupada[] = [];
  //Filtro de produtos
  produtos: Produto[] = [];
  produtosFiltrados!: Observable<Produto[]>;
  
  formulario!: FormGroup;
  graficos = [{texto: 'Linhas', valor: 'line'}, {texto:'Barras', valor: 'bar'}];
  listaMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  tipoGrafico: ChartType  = 'line';
  listaMesesSelecionada: string[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  ngOnInit(): void {
    this.erroCarregando = false;
    this.carregando = true;
    this.criarFormulario();   
    this.produtoService.listar().pipe(catchError(
      err => {
        this.erroCarregando = true;
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar produtos!' });
        throw 'Erro ao recuperar produtos! Detalhes: ' + err;
      })).subscribe((produtos) => {
        this.produtos = produtos;
        this.ordernarNome(this.produtos);
        console.log(produtos);
        this.carregando = false;
        this.criarFormulario();    
      });            

  }

  private criarFormulario() {
    this.formulario = this.formBuilder.group({
      ano: [new Date().getFullYear(), Validators.compose([
        Validators.required, Validators.min(1)
      ])],
      produto: ['', Validators.compose([
        Validators.required, this.produtoValidator()
      ])],
      grafico: ['', Validators.required],
      meses: [this.listaMeses, Validators.required],
    });

    //Faz o filtro de produtos e garante que o valor do campo produto é um objeto
    this.produtosFiltrados = this.formulario.controls['produto'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        if (ehString && nome && (nome != '') && this.produtos && (this.produtos.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          let produto = this.produtos.find(produto => produto.nome.toLowerCase() == nome.toLowerCase());
          if (produto) {
            this.formulario.get('produto')!.patchValue(produto, { emitEvent: false });
          }
        }
        return nome ? this._filterProduto(nome as string) : this.produtos.slice();
      })
    );
  }

  displayFnProduto(produto: Produto): string {
    return produto && produto.nome ? produto.nome : '';
  }

  private _filterProduto(nome: string): Produto[] {
    const filterValue = nome.toLowerCase();

    return this.produtos.filter(produto => produto.nome.toLowerCase().includes(filterValue));
  }  

  produtoValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if ((control.value !== undefined) && !(typeof control.value != 'string')) {
        return { 'produtoCadastrado': true };
      }
      return null;
    }
  }

  ordernarNome(objeto: { nome: string; }[]) {
    objeto.sort( (a: { nome: string; }, b: { nome: string; }) => {
      if ( a.nome < b.nome ){
        return -1;
      }
      if ( a.nome > b.nome ){
        return 1;
      }
      return 0;});
  }  

  public lineChartData(): ChartConfiguration['data'] {
    return {
      datasets: [
        {
          data: this.getDataSetCustos(),
          label: 'Compras (R$)',
          backgroundColor: 'rgba(22, 22, 134, 0.8)',
          borderColor: 'rgba(22, 22, 134, 0.8)',
        }, 
        {
          data: this.getDataSetCustoMedio(),
          label: 'Custo Médio (R$)',
          backgroundColor: 'rgba(114, 37, 128, 0.8)',
          borderColor: 'rgba(114, 37, 128, 0.8)',
        },   
        {
          data: this.getDataSetQuantidadeCompras(),
          label: 'Qtd. Compra',
          backgroundColor: 'rgba(0, 164, 0, 0.96)',
          borderColor: 'rgba(0, 164, 0, 0.96)',
        },    
        {
          data: this.getDataSetQuantidadeVendas(),
          label: 'Qtd. Venda',
          backgroundColor: 'rgba(240, 150, 0, 0.95)',
          borderColor: 'rgba(240, 150, 0, 0.95)',
        },                   

      ],
      labels: this.listaMesesSelecionada,
    };
  }

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5
      }
    },

    plugins: {
      legend: { display: true },
    }
  };

  recuperarDados() {
    //Recuperando os dados
    this.carregando = true;
    this.carregado = false;
    console.log(this.formulario.value.meses);
    this.produtoService.listarIndicador(this.formulario.value.produto._id, this.formulario.value.ano).pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar vendas! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar vendas! Detalhes: ' + err.error?.error;
      })).subscribe(
        (compras) => {
          this.tipoGrafico = this.formulario.value.grafico;
          this.listaMesesSelecionada = this.formulario.value.meses;
          this.carregando = false;
          this.carregado = true;
          console.log(compras);
          this.compras = compras;
        });
  };

  getDataSetCustos() {
    return this.getValores('custoTotal');
  }

  getDataSetQuantidadeCompras() {
    return this.getValores('quantidadeTotalCompras');
  }

   getDataSetQuantidadeVendas() {
    return this.getValores('quantidadeTotalVendas');
  }

  getDataSetCustoMedio() {
    return this.getValores('custoMedio');
  }  

  private getValores(campo: string) {
    let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    for (let i in this.compras) {
      let compra = this.compras[i];
      //https://bobbyhadz.com/blog/typescript-access-object-property-dynamically
      type ObjectKey = keyof typeof compra;
      const myVar = campo as ObjectKey;

      let valor = compra[myVar];
      data[parseInt(compra._id) - 1] = parseFloat('' + valor);
    }
    let retorno = [];
    for (let i in data) {
      if (this.listaMesesSelecionada.indexOf(this.listaMeses[i]) >= 0) {
        retorno.push(data[i]);
      }
    }
    return retorno;
  }  
}

