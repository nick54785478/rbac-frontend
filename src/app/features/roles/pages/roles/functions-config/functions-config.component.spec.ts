import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionsConfigComponent } from './functions-config.component';

describe('FunctionsConfigComponent', () => {
  let component: FunctionsConfigComponent;
  let fixture: ComponentFixture<FunctionsConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunctionsConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunctionsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
