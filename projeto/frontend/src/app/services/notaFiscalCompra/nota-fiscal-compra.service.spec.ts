import { TestBed } from '@angular/core/testing';

import { NotaFiscalCompraService } from './nota-fiscal-compra.service';

describe('NotaFiscalCompraService', () => {
  let service: NotaFiscalCompraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotaFiscalCompraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
