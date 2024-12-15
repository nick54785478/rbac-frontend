import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LayoutService } from './services/layout.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule],
  providers: [LayoutService],
})
export class LayoutModule {}
