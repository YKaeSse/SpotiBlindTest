import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMusicComponent } from './search-music.component';

describe('SearchMusicComponent', () => {
  let component: SearchMusicComponent;
  let fixture: ComponentFixture<SearchMusicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMusicComponent]
    });
    fixture = TestBed.createComponent(SearchMusicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
