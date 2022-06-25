import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectsFrequencyComponent } from './subjects-frequency.component';

describe('SubjectsFrequencyComponent', () => {
  let component: SubjectsFrequencyComponent;
  let fixture: ComponentFixture<SubjectsFrequencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectsFrequencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectsFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
