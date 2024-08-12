import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionSelectorComponent } from './app-champion-selector.component';

describe('AppChampionSelectorComponent', () => {
  let component: ChampionSelectorComponent;
  let fixture: ComponentFixture<ChampionSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChampionSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChampionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
