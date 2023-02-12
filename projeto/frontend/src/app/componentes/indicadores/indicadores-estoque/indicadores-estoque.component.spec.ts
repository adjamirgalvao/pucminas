import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresEstoqueComponent } from './indicadores-estoque.component';

describe('IndicadoresEstoqueComponent', () => {
  let component: IndicadoresEstoqueComponent;
  let fixture: ComponentFixture<IndicadoresEstoqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndicadoresEstoqueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicadoresEstoqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
