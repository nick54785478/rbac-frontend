import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';
import { SettingService } from '../setting/service/setting.service';
import { SettingType } from '../../core/enums/setting-type.enum';
import { firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CoreModule, SharedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  desc: any[] = [];
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;

  constructor(private settingService: SettingService) {}

  async ngOnInit(): Promise<void> {
    await firstValueFrom(
      this.settingService.query(
        'AUTH_SERVICE',
        SettingType.DESCRIPTION,
        '',
        '',
        'Y'
      )
    ).then((res) => {
      // 先依 priorityNo 做升序排序
      const sorted = res
        .slice() // 複製一份避免修改原陣列
        .sort((a, b) => Number(a.priorityNo) - Number(b.priorityNo));

      this.step1 = sorted[0]?.description;
      this.step2 = sorted[1]?.description;
      this.step3 = sorted[2]?.description;
      this.step4 = sorted[3]?.description;
    });
  }
}
