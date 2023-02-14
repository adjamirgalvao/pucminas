import { VendaService } from 'src/app/services/venda/venda.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { BubbleDataPoint, ChartConfiguration, ChartDataset, ChartType, ChartTypeRegistry, ScatterDataPoint } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { VendaAgrupada } from 'src/app/interfaces/VendaAgrupada';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// https://valor-software.com/ng2-charts/#LineChart
@Component({
  selector: 'app-indicadores-vendas',
  templateUrl: './indicadores-vendas.component.html',
  styleUrls: ['./indicadores-vendas.component.css']
})
export class IndicadoresVendasComponent implements OnInit{
  constructor(
    private formBuilder: FormBuilder,
    private vendaService: VendaService,
  ) {
  }

  carregando: boolean = false;
  carregado: boolean = false;
  alertas: Alerta[] = [];
  vendas: VendaAgrupada[] = [];

  formulario!: FormGroup;
  graficos = [{texto: 'Linhas', valor: 'line'}, {texto:'Barras', valor: 'bar'}];
  listaMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  tipoGrafico: ChartType  = 'line';
  listaMesesSelecionada: string[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      ano: [new Date().getFullYear(), Validators.compose([
        Validators.required, Validators.min(1)
      ])],
      grafico: ['', Validators.required],
      meses: [this.listaMeses, Validators.required],
    });
  }

  public lineChartData(): ChartConfiguration['data'] {
    return {
      datasets: [
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
        },     
        {
          data: this.getDataSetLucro(),
          label: 'Lucro (R$)',
          backgroundColor: 'rgba(240, 150, 0, 0.95)',
          borderColor: 'rgba(240, 150, 0, 0.95)',
        }
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
    this.vendaService.listarIndicador(this.formulario.value.ano).pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar vendas! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar vendas! Detalhes: ' + err.error?.error;
      })).subscribe(
        (vendas) => {
          this.tipoGrafico = this.formulario.value.grafico;
          this.listaMesesSelecionada = this.formulario.value.meses;
          this.carregando = false;
          this.carregado = true;
          console.log(vendas);
          this.vendas = vendas;
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
}

