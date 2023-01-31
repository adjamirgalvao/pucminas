import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVendedorComponent } from './editar-vendedor.component';

describe('EditarVendedorComponent', () => {
  let component: EditarVendedorComponent;
  let fixture: ComponentFixture<EditarVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarVendedorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
