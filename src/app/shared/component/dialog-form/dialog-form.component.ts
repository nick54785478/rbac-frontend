import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from '../../shared.module';
import { CoreModule } from '../../../core/core.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-form',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [DialogService, DynamicDialogRef],
  templateUrl: './dialog-form.component.html',
  styleUrl: './dialog-form.component.scss',
})
export class DialogFormComponent implements OnInit {
  constructor(public ref: DynamicDialogRef) {}
  ngOnInit(): void {}
}
