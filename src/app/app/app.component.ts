import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { LoadingService } from '../../services/loading.service';
import { delay } from 'rxjs';

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

  ngOnInit(): void {
    this._loadingService.isLoading$.pipe(delay(0)).subscribe((response) => {
      if (response) {
        this._spinnerService.show('loading');
      } else {
        this._spinnerService.hide('loading');
      }
    });
  }
}
