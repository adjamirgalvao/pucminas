import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, Observable, startWith, map } from 'rxjs';
import { Alerta } from 'src/app/interfaces/Alerta';
import { Cliente } from 'src/app/interfaces/Cliente';
import { ItemVendaAgrupada } from 'src/app/interfaces/ItemVendaAgrupada';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { VendaService } from 'src/app/services/venda/venda.service';

@Component({
  selector: 'app-produtos-mais-vendidos',
  templateUrl: './produtos-mais-vendidos.component.html',
  styleUrls: ['./produtos-mais-vendidos.component.css']
})
export class ProdutosMaisVendidosComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private vendaService: VendaService,
    private clienteService: ClienteService,
  ) {
  }

  erroCarregando: boolean = false;
  carregando: boolean = false;
  carregado: boolean = false;
  alertas: Alerta[] = [];
  itemVendasAgrupadas: ItemVendaAgrupada[] = [];

  formulario!: FormGroup;

  //Filtro de clientes
  clientes: Cliente[] = [];
  clientesFiltrados!: Observable<Cliente[]>;

  // Campos para a tabela
  displayedColumns: string[] = ['produto', 'quantidade', 'precoFinalTotal'];
  dataSource: MatTableDataSource<ItemVendaAgrupada> = new MatTableDataSource();

  //Sem isso não consegui fazer funcionar o sort e paginator https://stackoverflow.com/questions/50767580/mat-filtering-mat-sort-not-work-correctly-when-use-ngif-in-mat-table-parent  
  private paginator!: MatPaginator;
  private sort!: MatSort;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // para ordernar subcampo
    // https://stackoverflow.com/questions/55030357/angular-matsort-not-working-when-using-object-inside-datasource
    // e aqui descobri que tinha que colocar o item: any https://technology.amis.nl/frontend/sorting-an-angular-material-table/
    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch (property) {
        case 'produto': return item.produto!.nome;
        default: return item[property];
      }
    }
  }

  ngOnInit(): void {
    this.erroCarregando = true;
    this.carregando = true;    
    this.criarFormulario();    
    this.clienteService.listar().pipe(catchError(
      err => {
        this.erroCarregando = true;
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar clientes! Detalhes ${err.error?.error}` });
        throw 'Erro ao recuperar clientes! Detalhes: ' + err.error?.error;
      })).subscribe((clientes) => {
        this.clientes = clientes;
        this.carregando = false;
        this.ordernarNome(this.clientes);
        console.log(clientes);

        this.criarFormulario();
      }); 
  }


  private criarFormulario() {
    this.formulario = this.formBuilder.group({
      ano: [new Date().getFullYear(), Validators.compose([Validators.required, Validators.min(1)])],
      cliente: [null, this.clienteValidator()],
    });


    //Faz o filtro de clientes e garante que o valor do campo vendedor é um objeto
    this.clientesFiltrados = this.formulario.controls['cliente'].valueChanges.pipe(
      startWith(''), map(value => {
        let ehString = typeof value === 'string';
        const nome = typeof value === 'string' ? value : value?.nome;

        if (ehString && nome && (nome != '') && this.clientes && (this.clientes.length > 0)) {
          //https://stackoverflow.com/questions/45241103/patchvalue-with-emitevent-false-triggers-valuechanges-on-angular-4-formgrou
          let cliente = this.clientes.find(cliente => cliente.nome.toLowerCase() == nome.toLowerCase());
          if (cliente) {
            this.formulario.get('cliente')!.patchValue(cliente, { emitEvent: false });
          }
        }
        return nome ? this._filterCliente(nome as string) : this.clientes.slice();
      }),
    );       
  }
 
  clienteValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      //aqui eu deixo o cliente ficar vazio.
      if ((control.value !== undefined) && (control.value != '') && !(typeof control.value != 'string')) {
        console.log("valor cliente", control.value);
        return { 'clienteCadastrado': true };
      }
      return null;
    }
  }

  displayFnCliente(cliente: Cliente): string {
    return cliente && cliente.nome ? cliente.nome : '';
  }

  private _filterCliente(nome: string): Cliente[] {
    const filterValue = nome.toLowerCase();

    return this.clientes.filter(cliente => cliente.nome.toLowerCase().includes(filterValue));
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

  recuperarDados() {
    //Recuperando os dados
    this.carregando = true;
    this.carregado = false;
    this.vendaService.listarProdutosMaisVendidos(this.formulario.value.ano, this.formulario.value.cliente).pipe(catchError(
      err => {
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: `Erro ao recuperar vendas! Detalhes: ${err.error?.error}` });
        throw 'Erro ao recuperar vendas! Detalhes: ' + err.error?.error;
      })).subscribe(
        (itemVendasAgrupadas) => {
          this.carregando = false;
          this.carregado = true;
          console.log(itemVendasAgrupadas);
          this.itemVendasAgrupadas = itemVendasAgrupadas;
          //this.dataSource.data = this.itemVendasAgrupadas;
          //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
          this.dataSource = new MatTableDataSource(this.itemVendasAgrupadas);
          this.setDataSourceAttributes(); // para atualizar paginação          
        });
  };

}
