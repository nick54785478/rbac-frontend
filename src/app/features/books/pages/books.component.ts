import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';
import { ButtonModule } from 'primeng/button';
import { GroupRoleBookComponent } from './group-role-book/group-role-book.component';
import { PersonalRoleBookComponent } from './personal-role-book/personal-role-book.component';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    CoreModule,
    GroupRoleBookComponent,
    PersonalRoleBookComponent,
  ],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss',
})
export class BooksComponent {}
