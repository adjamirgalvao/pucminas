import { TestBed } from '@angular/core/testing';

import { UsuarioAutenticadoService } from './usuario-autenticado.service';

describe('UsuarioAutenticadoService', () => {
  let service: UsuarioAutenticadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioAutenticadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
