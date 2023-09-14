import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlindTestComponent } from './blind-test.component';

describe('BlindTestComponent', () => {
  let component: BlindTestComponent;
  let fixture: ComponentFixture<BlindTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlindTestComponent]
    });
    fixture = TestBed.createComponent(BlindTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
