import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { LoadingService } from '../../services/loading.service';
import { delay } from 'rxjs';
import { LocalStorageEnum } from '../../types/enums/local-storage.enum';
import { LocalStorageService } from '../../services/local-storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'online-shopping-client';
  private _loadingService = inject(LoadingService);
  private _spinnerService = inject(NgxSpinnerService);
  private _localStorageService = inject(LocalStorageService);
  private _loginService = inject(AuthService);

  ngOnInit(): void {
    this._loadingService.isLoading$.pipe(delay(0)).subscribe((response) => {
      if (response) {
        this._spinnerService.show('loading');
      } else {
        this._spinnerService.hide('loading');
      }
    });
    this.onDefault();
  }
  onDefault() {
    const expireTokenTime = parseInt(this._localStorageService.get(LocalStorageEnum.expiry_time)) * 1000; // * 1000 meant convert it to milisecond

    // if (!expireTokenTime) {
    //   this._loginService.logout();
    //   return;
    // }

  }
}
