import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupRoleBookComponent } from './group-role-book.component';

describe('GroupRoleBookComponent', () => {
  let component: GroupRoleBookComponent;
  let fixture: ComponentFixture<GroupRoleBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupRoleBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupRoleBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
