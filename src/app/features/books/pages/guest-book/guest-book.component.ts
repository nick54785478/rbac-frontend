import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../core/core.module';

@Component({
  selector: 'app-guest-book',
  standalone: true,
  imports: [SharedModule, CommonModule, CoreModule],
  templateUrl: './guest-book.component.html',
  styleUrl: './guest-book.component.scss'
})
export class GuestBookComponent {

}
