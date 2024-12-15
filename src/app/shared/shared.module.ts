import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimengModule } from './primeng/primeng.module';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { SystemMessageService } from '../core/services/system-message.service';
import { MessageService } from 'primeng/api';

/**
 * 共享模組 (Shared Module)
 * 包含可重用的元件、指令與管道，專門用於在應用的多個模組之間共享。
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    PrimengModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
  ],
  exports: [
    CommonModule,
    ButtonModule,
    PrimengModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
