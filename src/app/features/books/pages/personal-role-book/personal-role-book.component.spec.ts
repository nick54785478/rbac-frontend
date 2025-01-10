import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalRoleBookComponent } from './personal-role-book.component';

describe('PersonalRoleBookComponent', () => {
  let component: PersonalRoleBookComponent;
  let fixture: ComponentFixture<PersonalRoleBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalRoleBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalRoleBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
