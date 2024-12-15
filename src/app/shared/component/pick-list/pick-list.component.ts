import { Component } from '@angular/core';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-pick-list',
  standalone: true,
  imports: [SharedModule, CoreModule],
  templateUrl: './pick-list.component.html',
  styleUrl: './pick-list.component.scss',
})
export class PickListComponent {}
