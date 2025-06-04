import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { lastValueFrom, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogReaderComponent } from '../components/dialog-reader/dialog-reader.component';
import { ProductService } from '../../../../services/product-list.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QrCodeComponent } from '../../../components/qr-code/qr-code.component';
import { RESPONSE_STATUS } from '../../../../types/enums/response-status.enum';
import { AuthService } from '../../../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-list',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  animations: [
    trigger('fadeVideo', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideCarousel', [
      transition('* => *', [
        style({ transform: 'translateX({{offset}}%)' }),
        animate('500ms ease', style({ transform: 'translateX(0)' }))
      ], { params: { offset: 0 } })
    ])
  ]
})
export class ListComponent implements OnInit {
  private _service = inject(ProductService);
  private _cdr = inject(ChangeDetectorRef);
  private _dialogService = inject(MatDialog);
  private _authService = inject(AuthService);
  destroy$ = new Subject<void>();

  beautyData: any[] = [];
  fragranceData: any[] = [];
  furnitureData: any[] = [];
  groceryData: any[] = [];
  counts: { [key: string]: number } = {};
  previewUrl: SafeResourceUrl | null = null;
  images: any[] = [
    {image: '/image/intro1.png'},
    {image: '/image/intro2.png'},
    {image: '/image/intro3.png'},
  ]

  ngOnInit(): void {
    this._fetchBeautyList();
    this._fetchFragrancesList();
    this._fetchFurnitureList();
    this._fetchGroceriesList();
  }

  private async _fetchBeautyList() {
    let json: any = {
      category: ['beauty'],
    }
    const response = await lastValueFrom(this._service.getMany(json));
    if (!response) return;
    this.beautyData = response.data.products;
    this._cdr.markForCheck();
  }

  private async _fetchFragrancesList() {
    let json: any = {
      category: ['fragrances'],
    }
    const response = await lastValueFrom(this._service.getMany(json));
    if (!response) return;
    this.fragranceData = response.data.products;
    this._cdr.markForCheck();
  }

  private async _fetchFurnitureList() {
    let json: any = {
      category: ['furniture'],
    }
    const response = await lastValueFrom(this._service.getMany(json));
    if (!response) return;
    this.furnitureData = response.data.products;
    this._cdr.markForCheck();
  }

  private async _fetchGroceriesList() {
    let json: any = {
      category: ['groceries'],
    }
    const response = await lastValueFrom(this._service.getMany(json));
    if (!response) return;
    this.groceryData = response.data.products;
    this._cdr.markForCheck();
  }

  async onClick(id: string) {
    this._dialogService.open(DialogReaderComponent, {
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
    // console.log('Buy clicked: ', payload);

    if (products.length > 0) {
      const response = await lastValueFrom(this._service.createOrder(payload));
      if (response.status != RESPONSE_STATUS.SUCCESS) return;
      this._dialogService.open(QrCodeComponent, {
        width: '30vw',
        minHeight: '40vh',
        maxHeight: '60vh',
        disableClose: false,
        data: {
          product: response.data,
        },
      })
    }
  }
}
