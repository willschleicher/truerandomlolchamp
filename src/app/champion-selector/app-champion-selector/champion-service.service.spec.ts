import { TestBed } from '@angular/core/testing';

import { AppChampionSelectorService } from './app-champion-selector.service';

describe('ChampionServiceService', () => {
  let service: AppChampionSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppChampionSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
