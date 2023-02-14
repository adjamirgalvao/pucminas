import { TestBed } from '@angular/core/testing';

import { ItemVendaService } from './item-venda.service';

describe('ItemVendaService', () => {
  let service: ItemVendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemVendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
