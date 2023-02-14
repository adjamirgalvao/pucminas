import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosMaisVendidosComponent } from './produtos-mais-vendidos.component';

describe('ProdutosMaisVendidosComponent', () => {
  let component: ProdutosMaisVendidosComponent;
  let fixture: ComponentFixture<ProdutosMaisVendidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProdutosMaisVendidosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdutosMaisVendidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
