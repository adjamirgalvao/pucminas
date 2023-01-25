import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicaoCompraComponent } from './edicao-compra.component';

describe('EdicaoCompraComponent', () => {
  let component: EdicaoCompraComponent;
  let fixture: ComponentFixture<EdicaoCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdicaoCompraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdicaoCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
