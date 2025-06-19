import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { QrCodeModule } from 'ng-qrcode';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DialogRef } from '@angular/cdk/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
@Component({
  selector: 'app-qr-code',
  imports: [CommonModule, QrCodeModule],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit {
  apiRoute: any;
  pollingInterval: any;
  scanned = false;

  constructor(
    private http: HttpClient,
    private _snackbar: MatSnackBar,
    private _dialogRef: DialogRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('DIALOG-DATA: ', data);
    this.apiRoute = `http://192.168.1.152:2002/api/order/${data.product._id}/pay-scan`;
  }

  ngOnInit(): void {
    this.startPolling();
  }

  startPolling() {
    let attempts = 0;
    this.pollingInterval = setInterval(() => {
    attempts++;
      this.http.get<{ status: string }>(`http://192.168.1.152:2002/api/order/${this.data.product._id}/status`).subscribe((response) => {
        if (!response) return;
        if (response.status === 'paid') {
          clearInterval(this.pollingInterval);
          this.scanned = true;
          this._snackbar.openFromComponent(SnackbarComponent, {
            data: { message: 'Payment successful!' },
            duration: 2000,
            panelClass: 'panel-success',
          });
            this._dialogRef.close();
          }
        });
      if (attempts >= 5) {
        clearInterval(this.pollingInterval);
      }
    }, 3000);
  }
}
