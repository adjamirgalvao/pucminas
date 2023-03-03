import { AuthService } from 'src/app/services/autenticacao/auth/auth.service';
import { VendaService } from 'src/app/services/venda/venda.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { BubbleDataPoint, ChartConfiguration, ChartDataset, ChartType, ChartTypeRegistry, ScatterDataPoint } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, map, Observable, startWith } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { VendaAgrupada } from 'src/app/interfaces/VendaAgrupada';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { VendedorService } from 'src/app/services/vendedor/vendedor.service';
import { Vendedor } from 'src/app/interfaces/Vendedor';

// https://valor-software.com/ng2-charts/#LineChart
@Component({
  selector: 'app-indicadores-vendas',
  templateUrl: './indicadores-vendas.component.html',
  styleUrls: ['./indicadores-vendas.component.css']
})
export class IndicadoresVendasComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private vendaService: VendaService,
    private vendedorService: VendedorService,
    private authService: AuthService,
  ) {
  }

  carregando: boolean = false;
  carregandoGrafico: boolean = false;
  erroCarregando: boolean = false;
  isOnlyVendedor: boolean = false;
  carregado: boolean = false;
  alertas: Alerta[] = [];
  vendas: VendaAgrupada[] = [];
  public dados: any;

  //Filtro de vendedores
  vendedor: any = null;

  vendedores: Vendedor[] = [];
  vendedoresFiltrados!: Observable<Vendedor[]>;

  formulario!: FormGroup;
  graficos = [{ texto: 'Linhas', valor: 'line' }, { texto: 'Barras', valor: 'bar' }];
  listaMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  tipoGrafico: ChartType = 'line';
  listaMesesSelecionada: string[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  ngOnInit(): void {
    this.isOnlyVendedor = this.authService.isVendedor() && !this.authService.isGestor();
    this.criarFormulario();
    this.carregando = true;
    this.vendedorService.listar().pipe(catchError(
      err => {
        this.erroCarregando = true;
        this.carregando = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar vendedores! Detalhes ${err.error?.error}` });
        throw 'Erro ao recuperar vendedores! Detalhes: ' + err.error?.error;
      })).subscribe((vendedores) => {
        this.carregando = false;
        this.vendedores = vendedores;
        this.ordernarNome(this.vendedores);
        console.log(vendedores);
        this.criarFormulario();
      });

    if (this.authService.isLogado() && this.authService.isVendedor()) {
      this.vendedorService.buscarPorEmail(this.authService.getUsuario().email!).pipe(catchError(
        err => {
          this.carregando = false;
          if (err.status == 404) {
            this.adicionarAlerta({ tipo: 'warning', mensagem: `Aviso: O usuário não possui cadastro de vendedor` });
          }
          throw 'Erro ao recuperar o vendedor! Detalhes: ' + err.error?.error;
        })).subscribe((vendedor) => {
          this.vendedor = vendedor;
          this.criarFormulario();
        });
    }
    this.criarFormulario();
  }

  private criarFormulario() {
    if (this.isOnlyVendedor) {
      this.formulario = this.formBuilder.group({
        ano: [new Date().getFullYear(), Validators.compose([
          Validators.required, Validators.min(1)
        ])],
        vendedor: [{ value: this.vendedor, disabled: this.readOnly() }, Validators.compose([
          Validators.required, this.vendedorValidator()
        ])],

        grafico: ['', Validators.required],
        meses: [this.listaMeses, Validators.required],
      });
    } else {
      this.formulario = this.formBuilder.group({
        ano: [new Date().getFullYear(), Validators.compose([
          Validators.required, Validators.min(1)
        ])],
        vendedor: [{ value: this.vendedor, disabled: this.readOnly() }, this.vendedorValidator()],

        grafico: ['', Validators.required],
        meses: [this.listaMeses, Validators.required],
      });
    }


    //Faz o filtro de vendedores e garante que o valor do campo vendedor é um objeto
    this.vendedoresFiltrados = this.formulario.controls['vendedor'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        if (ehString && nome && (nome != '') && this.vendedores && (this.vendedores.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          let vendedor = this.vendedores.find(vendedor => vendedor.nome.toLowerCase() == nome.toLowerCase());
          if (vendedor) {
            this.formulario.get('vendedor')!.patchValue(vendedor, { emitEvent: false });
          }
        }
        return nome ? this._filterVendedor(nome as string) : this.vendedores.slice();
      }),
    );
  }

  displayFnVendedor(vendedor: Vendedor): string {
    return vendedor && vendedor.nome ? vendedor.nome : '';
  }

  private _filterVendedor(nome: string): Vendedor[] {
    const filterValue = nome.toLowerCase();

    return this.vendedores.filter(vendedor => vendedor.nome.toLowerCase().includes(filterValue));
  }

  vendedorValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      //Segunda condição deixa o vendedor ser opcional
      if ((control.value !== undefined) && (control.value != '' && !this.isOnlyVendedor) && !(typeof control.value != 'string')) {
        return { 'vendedorCadastrado': true };
      }
      return null;
    }
  }

  ordernarNome(objeto: { nome: string; }[]) {
    objeto.sort((a: { nome: string; }, b: { nome: string; }) => {
      if (a.nome < b.nome) {
        return -1;
      }
      if (a.nome > b.nome) {
        return 1;
      }
      return 0;
    });
  }

  public readOnly(): boolean {
    return this.isOnlyVendedor || this.erroCarregando;
  }

  public formularioValido(): boolean {
    let retorno = this.formulario?.valid;
    if (this.isOnlyVendedor) {
      retorno = retorno && this.vendedor;
    }

    return retorno;
  }

  public getLineChartData(): ChartConfiguration['data'] {
    return {
      datasets: this.getDataSets(),
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

  private getDataSets(): ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[] {
    let retorno = [
      {
        data: this.getDataSetCustos(),
        label: 'Custos (R$)',
        backgroundColor: 'rgba(22, 22, 134, 0.8)',
        borderColor: 'rgba(22, 22, 134, 0.8)',
      },
      {
        data: this.getDataSetVendas(),
        label: 'Vendas (R$)',
        backgroundColor: 'rgba(0, 164, 0, 0.96)',
        borderColor: 'rgba(0, 164, 0, 0.96)',
      },
      {
        data: this.getDataSetTicketMedio(),
        label: 'Ticket Médio (R$)',
        backgroundColor: 'rgba(114, 37, 128, 0.8)',
        borderColor: 'rgba(114, 37, 128, 0.8)',
      }];
    if (!this.isOnlyVendedor) {
      retorno.push({
        data: this.getDataSetLucro(),
        label: 'Lucro (R$)',
        backgroundColor: 'rgba(240, 150, 0, 0.95)',
        borderColor: 'rgba(240, 150, 0, 0.95)',
      });
    }

    return retorno;
  }

  recuperarDados() {
    let id_vendedor = null;
    //Recuperando os dados
    this.carregando = true;
    this.carregandoGrafico = true;
    this.carregado = false;
    console.log(this.formulario.value.meses);
    if (this.isOnlyVendedor) {
      id_vendedor = this.vendedor._id;
    } else {
      if (this.formulario.get('vendedor')?.valid && (this.formulario.value.vendedor)) {
        id_vendedor = this.formulario.value.vendedor._id;
      }
    }
    console.log('id_vendedor', id_vendedor);
    this.vendaService.listarIndicador(this.formulario.value.ano, id_vendedor).pipe(catchError(
      err => {
        this.carregando = false;
        this.carregandoGrafico = false;
        this.adicionarAlerta({ tipo: 'danger', mensagem: `Erro ao recuperar vendas! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar vendas! Detalhes: ' + err.error?.error;
      })).subscribe(
        (vendas) => {
          this.tipoGrafico = this.formulario.value.grafico;
          this.listaMesesSelecionada = this.formulario.value.meses;
          this.carregando = false;
          this.carregandoGrafico = false;
          this.carregado = true;
          console.log(vendas);
          this.vendas = vendas;
          this.dados = this.getLineChartData();
        });
  };

  getDataSetCustos() {
    return this.getValores('custoTotal');
  }

  getDataSetVendas() {
    return this.getValores('vendasTotal');
  }

  getDataSetTicketMedio() {
    return this.getValores('ticketMedio');
  }

  getDataSetLucro() {
    return this.getValores('lucroTotal');
  }


  private getValores(campo: string) {
    let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let i in this.vendas) {
      let venda = this.vendas[i];
      //https://bobbyhadz.com/blog/typescript-access-object-property-dynamically
      type ObjectKey = keyof typeof venda;
      const myVar = campo as ObjectKey;

      let valor = venda[myVar];
      data[parseInt(venda._id) - 1] = parseFloat('' + valor);
    }
    let retorno = [];
    for (let i in data) {
      if (this.listaMesesSelecionada.indexOf(this.listaMeses[i]) >= 0) {
        retorno.push(data[i]);
      }
    }
    return retorno;
  }
   
  public adicionarAlerta(alerta: any){
    if (!this.alertas.find(a => a.tipo === alerta.tipo && a.mensagem === alerta.mensagem)) {
      this.alertas.push(alerta);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

