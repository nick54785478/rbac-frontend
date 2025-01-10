import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../core/core.module';

@Component({
  selector: 'app-group-role-book',
  standalone: true,
  imports: [SharedModule, CommonModule, CoreModule],
  templateUrl: './group-role-book.component.html',
  styleUrl: './group-role-book.component.scss'
})
export class GroupRoleBookComponent {

}
