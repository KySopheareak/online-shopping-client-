import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogReaderComponent } from '../components/dialog-reader/dialog-reader.component';
import { ProductService } from '../../../../services/book-list.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QrCodeComponent } from '../../../components/qr-code/qr-code.component';
import { RESPONSE_STATUS } from '../../../../types/enums/response-status.enum';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-list',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private _service = inject(ProductService);
  private _cdr = inject(ChangeDetectorRef);
  private _dialogService = inject(MatDialog);
  private _authService = inject(AuthService);

  data: any[] = [];
  counts: { [key: string]: number } = {};
  previewUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {
    this._fetchList();
  }

  private async _fetchList() {
    const response = await lastValueFrom(this._service.getMany());
    if (!response) return;
    console.log(response);
    this.data = response.data;
    this._cdr.markForCheck();
  }

  async onClick(id: string) {
    this._dialogService
      .open(DialogReaderComponent, {
        minWidth: '70vw',
        height: '80vh',
        disableClose: true,
        data: {
          id,
        },
      })
      .afterClosed();
  }

  onCartClick(id: string) {
    this.counts[id] = 1;
  }

  onAdd(id: string) {
    if (this.counts[id] < 99) {
      // optional max limit
      this.counts[id]++;
    }
  }

  onMinus(id: string) {
    if (this.counts[id] > 1) {
      this.counts[id]--;
    } else {
      this.counts[id] = 0;
    }
  }

  async onBuy() {
    const products = Object.entries(this.counts).filter(([_, quantity]) => quantity > 0).map(([product, quantity]) => ({
        product,
        quantity,
      }));
      let payload: any = {
        user: this._authService.userId,
        products: products,
      }
    console.log('Buy clicked: ', payload);

    if (products.length > 0) {
      const response = await lastValueFrom(this._service.createOrder(payload));
      if (response.status != RESPONSE_STATUS.SUCCESS) return;
      this._dialogService.open(QrCodeComponent, {
        minWidth: '30vw',
        minHeight: '40vh',
        disableClose: false,
        data: {
          product: response.data,
        },
      })
    }
  }
}
