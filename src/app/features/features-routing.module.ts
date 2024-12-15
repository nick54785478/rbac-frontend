import { NgModule } from '@angular/core';
import { routes } from './features.routes';
import { RouterModule } from '@angular/router';

/**
 * 功能模組 (Feature Module)
 * 負責封裝應用的某一特定功能區域，並且可以進行懶加載。
 */
@NgModule({
  // 此處使用 RouterModule.forChild 進行懶加載模組
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
