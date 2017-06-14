import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScnLoaderComponent } from './scn-loader.component';

describe('ScnLoaderComponent', () => {
  let component: ScnLoaderComponent;
  let fixture: ComponentFixture<ScnLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScnLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScnLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
