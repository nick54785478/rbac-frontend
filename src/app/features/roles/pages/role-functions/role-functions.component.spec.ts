import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleFunctionsComponent } from './role-functions.component';

describe('RoleFunctionComponent', () => {
  let component: RoleFunctionsComponent;
  let fixture: ComponentFixture<RoleFunctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFunctionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
