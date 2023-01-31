import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVendaComponent } from './editar-venda.component';

describe('EditarVendaComponent', () => {
  let component: EditarVendaComponent;
  let fixture: ComponentFixture<EditarVendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarVendaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarVendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
