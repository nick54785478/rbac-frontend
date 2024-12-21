// import { Option } from './../../shared/models/option.model';
// import { StorageService } from './storage.service';

// import { MenuItem } from 'primeng/api';
// import { Injectable } from '@angular/core';
// import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
// import { ReplaySubject, take } from 'rxjs';

// /**
//  * 多國語系的服務。
//  *
//  * @export
//  * @class LanguageService
//  */
// @Injectable({
//   providedIn: 'root'
// })
// export class LanguageService {

//   private static readonly LANGUAGE = 'language';

//   /*
//   參考 https://edwardzou.blogspot.com/2019/01/ngx-translate.html
//   https://angular.io/guide/rx-library#naming-conventions-for-observables 解釋 $ 的命名
//   Because Angular applications are mostly written in TypeScript,
//   you will typically know when a variable is an observable.
//   Although the Angular framework does not enforce a naming convention for observables,
//   you will often see observables named with a trailing "$" sign.
//   This can be useful when scanning through code and looking for observable values.
//   */
//   language$ = new ReplaySubject<LangChangeEvent>(1);

//   languageList = ['en-us', 'zh-tw', 'zh-cn'];

//   constructor(private translateService: TranslateService,
//     private storageService: StorageService) { }

//   /**
//    *  根頁面初始化執行的 function
//    */
//   setInitState() {
//     this.translateService.addLangs(this.languageList);

//     const selectedLanguage = this.storageService.getLocalStorageItem(LanguageService.LANGUAGE);
//     if (selectedLanguage) {
//       this.setLang(selectedLanguage);
//     } else if (this.translateService.getBrowserLang() === 'zh') {
//       // 根據使用者的瀏覽器語言設定，如果是中文就顯示中文，否則都顯示英文
//       // BrowserLang 只會有前兩碼，不足以判斷繁體或簡體
//       const browserCultureLang = this.translateService.getBrowserCultureLang();
//       console.log('getBrowserCultureLang : ' + browserCultureLang);
//       if (browserCultureLang?.toUpperCase().match(/-CN|CHS|HANS/i)) {
//         this.setLang('zh-cn');
//       } else {
//         this.setLang('zh-tw');
//       }
//     } else {
//       this.setLang('en-us');
//     }
//   }

//   /**
//    * 設定目前使用的語系
//    *
//    * @param lang
//    */
//   setLang(lang: string) {
//     this.translateService.onLangChange.pipe(take(1)).subscribe(result => {
//       this.language$.next(result);
//       localStorage.setItem(LanguageService.LANGUAGE, lang);
//     });
//     this.translateService.use(lang);
//   }

//   /**
//    * MenuItem 語系切換
//    * @param children 要進行語系切換的 MenuItem[]
//    */
//   processMenuTranslation(children: MenuItem[]) {
//     for (let item of children) {
//       if (item.separator) {
//         continue;
//       }

//       if (item.automationId) {
//         item.label = this.translateService.instant(item.automationId);
//       }

//       if (item.items) {
//         this.processMenuTranslation(item.items);
//       }
//     }
//   }

//   /**
//    * Option 語系切換
//    * @param options 要進行語系切換的 Option[]
//    */
//   // processOptionTranslation(options: Option[]) {
//   //   for (let option of options) {
//   //     if (option.id) {
//   //       option.label = this.translateService.instant(option.id);
//   //     }
//   //   }
//   // }

//   /**
//    * Option 語系切換
//    * @param options 要進行語系切換的 Option[]
//    */
//   processOptionTranslation(...options: Option[][]): void {
//     options.forEach(option => {
//       for (let opt of option) {
//         if (opt.id) {
//           opt.label = this.translateService.instant(opt.id);
//         }
//       }
//     })
//   }
// }
