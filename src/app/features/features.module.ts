import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesRoutingModule } from './features-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MessageService } from 'primeng/api';

/**
 * 功能模組 (Feature Module)
 * 負責封裝應用的某一特定功能區域，並且可以進行懶加載。
 */
@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, FeaturesRoutingModule],
  providers: [],
})
export class FeaturesModule {}
