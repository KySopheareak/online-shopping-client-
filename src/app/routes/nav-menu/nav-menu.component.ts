import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../services/auth.service';
import {
  debounce,
  filter,
  finalize,
  lastValueFrom,
  map,
  startWith,
  Subscription,
  switchMap,
  timer,
} from 'rxjs';
import { ProductService } from '../../../services/product-list.service';
import { RESPONSE_STATUS } from '../../../types/enums/response-status.enum';
import { DialogReaderComponent } from '../list/components/dialog-reader/dialog-reader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../../services/cart.service';
import { QrCodeComponent } from '../../components/qr-code/qr-code.component';

@Component({
  selector: 'app-nav-menu',
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatMenuModule,
    ReactiveFormsModule,
  ],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent implements OnInit, OnDestroy {
  private _router = inject(Router);
  private _service = inject(ProductService);
  private _authService = inject(AuthService);
  private _dialogService = inject(MatDialog);
  private _destroyRef = inject(DestroyRef);
  private _cdr = inject(ChangeDetectorRef);
  private _cartService = inject(CartService);

  searchCtrl: UntypedFormControl = new UntypedFormControl('');

  products: any[] = [];
  counts: { [key: string]: number } = {};
  totalCartCount = 0;
  private sub!: Subscription;

  constructor() {
    this.searchCtrl.valueChanges
      .pipe(
        startWith(''),
        debounce(() => timer(500)),
        filter((value) => value !== '' && value !== null),
        switchMap((value) => {
          return this.onSearch(value);
        }),
        finalize(() => {
          this._cdr.markForCheck();
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.sub = this._cartService.counts$.subscribe((counts) => {
      this.totalCartCount = this._cartService.getTotalCount(counts);
      this.counts = counts;
      this._cdr.markForCheck();
    });
  }

  onReloadPage() {
    this._router.navigate(['/list']);
  }

  async onSearch(params?: any) {
    let json = {
      search: params || null,
    };
    const response = await lastValueFrom(this._service.getMany(json));
    if (response.status !== RESPONSE_STATUS.SUCCESS) return;
    this.products = response.data.products;
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
    this._cartService.setCount(id, 1);
  }

  onAdd(id: string) {
    this._cartService.increment(id);
  }

  onMinus(id: string) {
    this._cartService.decrement(id);
  }

  onLogout() {
    this._authService.logout();
  }

  async onBuy() {
    const products = Object.entries(this.counts).filter(([_, quantity]) => quantity > 0).map(([product, quantity]) => ({
        product,
        quantity,
      }));
    let payload: any = {
      user: this._authService.userId,
      products: products,
    };

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
      });
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
