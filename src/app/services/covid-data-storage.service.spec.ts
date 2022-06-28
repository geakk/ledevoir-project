import { TestBed } from '@angular/core/testing';

import { CovidDataStorageService } from './covid-data-storage.service';

describe('CovidDataStorageService', () => {
  let service: CovidDataStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CovidDataStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
