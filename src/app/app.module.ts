import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

/**
 * 根模組 (Root Module)
 * 是應用的起點，負責啟動應用。
 */
@NgModule({
  declarations: [],
  imports: [
    CoreModule,
    SharedModule,
    ToastModule,
    BrowserModule,
    DynamicDialogModule,
    ProgressSpinnerModule,
    BrowserAnimationsModule,
    AppRoutingModule, // 僅匯入 AppRoutingModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
  ],
  bootstrap: [],
})
export class AppModule {}
