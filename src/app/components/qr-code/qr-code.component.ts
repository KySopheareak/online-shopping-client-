import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent {
  apiRoute: any = 'http://192.168.0.101:3000/api/login?token=XYZ123';
}
