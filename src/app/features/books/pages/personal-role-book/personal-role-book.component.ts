import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../core/core.module';

@Component({
  selector: 'app-personal-role-book',
  standalone: true,
  imports: [SharedModule, CommonModule, CoreModule],
  templateUrl: './personal-role-book.component.html',
  styleUrl: './personal-role-book.component.scss'
})
export class PersonalRoleBookComponent {

}
