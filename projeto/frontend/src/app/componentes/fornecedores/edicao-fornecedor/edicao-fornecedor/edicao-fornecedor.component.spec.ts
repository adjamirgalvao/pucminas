import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicaoFornecedorComponent } from './edicao-fornecedor.component';

describe('EdicaoFornecedorComponent', () => {
  let component: EdicaoFornecedorComponent;
  let fixture: ComponentFixture<EdicaoFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdicaoFornecedorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdicaoFornecedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
