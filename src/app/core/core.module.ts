import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemMessageService } from './services/system-message.service';
import { MessageService } from 'primeng/api';

/**
 * 核心模組 (Core Module)
 * 包含應用中僅需實例化一次的服務，例如全局的單例服務、導航條等。
 */
@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [MessageService, SystemMessageService],
})
export class CoreModule {}
