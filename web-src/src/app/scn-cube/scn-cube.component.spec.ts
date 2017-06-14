import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScnCubeComponent } from './scn-cube.component';

describe('ScnCubeComponent', () => {
  let component: ScnCubeComponent;
  let fixture: ComponentFixture<ScnCubeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScnCubeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScnCubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
