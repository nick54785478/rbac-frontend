import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesConfigComponent } from './roles-config.component';

describe('RolesConfigComponent', () => {
  let component: RolesConfigComponent;
  let fixture: ComponentFixture<RolesConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
