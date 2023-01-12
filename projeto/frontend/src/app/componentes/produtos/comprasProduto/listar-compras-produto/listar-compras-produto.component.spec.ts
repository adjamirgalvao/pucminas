import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarComprasProdutoComponent } from './listar-compras-produto.component';

describe('ListarComprasProdutoComponent', () => {
  let component: ListarComprasProdutoComponent;
  let fixture: ComponentFixture<ListarComprasProdutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarComprasProdutoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarComprasProdutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
