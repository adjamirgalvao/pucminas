import { ItemCompra } from 'src/app/interfaces/ItemCompra';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Location } from '@angular/common';

import { Alerta } from '../../../interfaces/Alerta';
import { CompraService } from 'src/app/services/compra/compra.service';
import { Compra } from 'src/app/interfaces/Compra';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ModalConfirmacaoComponent } from '../../util/modal-confirmacao/modal-confirmacao.component';
import { MatDialog } from '@angular/material/dialog';
import { ProdutoService } from 'src/app/services/produto/produto.service';
import { Produto } from 'src/app/interfaces/Produto';

@Component({
  selector: 'app-edicao-compra',
  templateUrl: './edicao-compra.component.html',
  styleUrls: ['./edicao-compra.component.css'],

})

export class EdicaoCompraComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private compraService: CompraService,
    private produtoService: ProdutoService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    public confirmacao: MatDialog) {
      // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
      // não pode ficar no OnInit 
      let modo = this.router.getCurrentNavigation()?.extras.state?.['operacao'];
      if (modo) {
         this.operacao = modo;
         this.leitura = true;
      }
    }

  formulario!: FormGroup;

  alertas: Alerta[] = [];
  salvando: boolean = false;
  listar: boolean = false;
  erroCarregando: boolean = false;
  carregando: boolean = false;
  leitura: boolean = false;

  inicial: Compra = {
    numero: '',
    data: new Date(),
  };

  itensCompra: ItemCompra[] = [];
  produtos: Produto[] = [];

  operacao!: string;

  @ViewChild('formDirective')
  private formDirective!: NgForm;
  

   // Campos para a tabela
  displayedColumns: string[] = ['produto.nome', 'quantidade', 'preco', 'actions'];
  dataSource: MatTableDataSource<ItemCompra> = new MatTableDataSource();

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
         case 'produto.nome': return  item.produto.nome;
         default: return item[property];
      }
   }
  }
  
  ngOnInit(): void {
    this.listar = (this.route.snapshot.queryParamMap.get('listar') == 'true');
    const id = this.route.snapshot.paramMap.get('id');

    console.log('id ', id);
    if (!this.operacao){
       this.operacao = (id == null) ? 'Cadastrar' : 'Editar';
    }

    this.criarFormulario();
    this.erroCarregando = false;
    this.carregando = true;
    this.produtoService.listar().pipe(catchError(
      err => {
        this.erroCarregando = true;
        this.carregando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar produtos!' });
        throw 'Erro ao recuperar produtos! Detalhes: ' + err;
      })).subscribe((produtos) => {
        this.produtos = produtos;
        if (this.operacao != 'Cadastrar') {
          this.erroCarregando = false;
          this.carregando = true;
          this.compraService.buscarPorId(id!).pipe(catchError(
            err => {
              this.erroCarregando = true;
              this.carregando = false;
              this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao recuperar a compra!' });
              throw 'Erro ao recuperar a compra! Detalhes: ' + err;
            })).subscribe((compra) => {
              this.carregando = false;
              if (compra != null) {
                this.inicial = compra;
                console.log('inicial', this.inicial);
                this.criarFormulario();
              } else {
                this.alertas.push({ tipo: 'danger', mensagem: 'Compra não encontrada!' });
                this.erroCarregando = true;
              }
            });
        } else {
          this.carregando = false;
        }
      });

  }

  salvar(): void {
    // Criação da compra
    const compra: Compra = {
      data: this.formulario.value.data,
      numero: this.formulario.value.numero,
     // preco: this.formulario.value.preco,
    };

    this.salvando = true;
    if (this.operacao == 'Cadastrar') {
      this.cadastrarCompra(compra);
    } else {
      compra._id = this.inicial._id!;
      this.editarCompra(compra);
    }
  }

  cancelar(): void {

    // Testa para forçar a navegação. Senão fica mostrando a mensagem de sucesso da edição que adicionou estado
    if ((this.operacao != 'Cadastrar') || this.listar) {
        this.router.navigate(['/compras']);
    } else {
      //https://stackoverflow.com/questions/35446955/how-to-go-back-last-page
      this.location.back();
    }    
  }

  formularioValido(): boolean {
    return this.formulario.get('data')!.valid && this.formulario.get('numero')!.valid && this.itensCompra.length > 0;
  }

  formularioIncluirValido(): boolean {
    return this.formulario.get('quantidade')!.valid && this.formulario.get('preco')!.valid;
  }


  private criarFormulario() {
    //https://stackoverflow.com/questions/44969382/angular-2-formbuilder-disable-fields-on-checkbox-select
    this.formulario = this.formBuilder.group({
      data: [this.inicial.data, Validators.compose([
        Validators.required
      ])],
      numero: [this.inicial.numero],        
      quantidade: [0, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])],
      preco: [0, Validators.compose([
        Validators.required, Validators.min(0.01)
      ])]
  });
  }

  private cadastrarCompra(compra: Compra) {
    this.compraService.criar(compra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao cadastrar compra!' });
        throw 'Erro ao cadastrar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          this.alertas = [];
          this.alertas.push({ tipo: 'success', mensagem: `Compra "${compra.numero}" cadastrada com sucesso!` });
          //https://stackoverflow.com/questions/60184432/how-to-clear-validation-errors-for-mat-error-after-submitting-the-form
          this.formDirective.resetForm(this.inicial);
        });
  }

  readOnly(){
    return this.salvando  || this.erroCarregando || this.leitura;
  }

  private editarCompra(compra: Compra) {
    /*
    this.salvando = true;
    this.service.editar(compra).pipe(catchError(
      err => {
        this.salvando = false;
        this.alertas.push({ tipo: 'danger', mensagem: 'Erro ao editar compra!' });
        throw 'Erro ao editar compra. Detalhes: ' + err;
      })).subscribe(
        () => {
          this.salvando = false;
          // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
          this.router.navigate(['/compras'],  {state: {alerta: {tipo: 'success', mensagem: `Compra "${compra.numero}" salva com sucesso!`} }});
        });
    */    
  }


  adicionarItem(){
    const itemCompra: ItemCompra = {
      preco: this.formulario.value.preco,
      quantidade: this.formulario.value.quantidade,
      id_produto: '1',
      produto: {
          nome: 'Teste',
          quantidade: 1,
          preco: 1,
          precoCusto: 1
      }
    };
    this.itensCompra.push(itemCompra);

    // resetando parte do formulario
    let campos = ['quantidade', 'preco'];
    campos.map(campo => {
        this.formulario.get(campo)?.setValue(0); 
        this.formulario.get(campo)?.markAsUntouched();
    });
    this.atualizarTabela();
  }

  atualizarTabela() : void {
    //https://stackoverflow.com/questions/54744770/how-to-delete-particular-row-from-angular-material-table-which-doesnt-have-filte
    this.dataSource = new MatTableDataSource(this.itensCompra);
    this.setDataSourceAttributes(); // para atualizar paginação
  }

  confirmarExcluirItemCompra(itemCompra: ItemCompra) {
    const confirmacaoRef = this.confirmacao.open(ModalConfirmacaoComponent, {
      data: {
        mensagem: `Confirma a exclusão da compra produto '${itemCompra.produto?.nome}'?`,
        titulo: 'Confirmação de Exclusão de Compra de Produto'
      },
    });

    confirmacaoRef.afterClosed().subscribe(result => {
      if (result == 'Sim') {
        this.itensCompra.splice(this.itensCompra.indexOf(itemCompra), 1);
        this.atualizarTabela();
    }
    });
  }

}