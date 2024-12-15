import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './roles.routes';

@NgModule({
  // 此處使用 RouterModule.forChild 進行懶加載模組
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesRoutingModule {}
