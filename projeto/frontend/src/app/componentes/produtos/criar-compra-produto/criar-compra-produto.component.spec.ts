import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarCompraProdutoComponent } from './criar-compra-produto.component';

describe('CriarCompraProdutoComponent', () => {
  let component: CriarCompraProdutoComponent;
  let fixture: ComponentFixture<CriarCompraProdutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CriarCompraProdutoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriarCompraProdutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
