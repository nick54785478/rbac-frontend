import { TestBed } from '@angular/core/testing';

import { RoleFunctionsService } from './group-roles.service';

describe('RoleFunctionsService', () => {
  let service: RoleFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
