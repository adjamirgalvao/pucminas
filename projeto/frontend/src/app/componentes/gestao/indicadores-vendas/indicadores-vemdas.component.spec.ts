import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresVendasComponent } from './indicadores-vendas.component';

describe('IndicadoresComponent', () => {
  let component: IndicadoresVendasComponent;
  let fixture: ComponentFixture<IndicadoresVendasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndicadoresVendasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicadoresVendasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
