import { TestBed } from '@angular/core/testing';

import { DocumentoMaterialService } from './documento.material.service';

describe('DocumentoMaterialService', () => {
  let service: DocumentoMaterialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentoMaterialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
