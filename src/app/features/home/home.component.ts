import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CoreModule, SharedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {}
}
