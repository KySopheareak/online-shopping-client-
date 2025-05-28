import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { DialogReaderComponent } from '../components/dialog-reader/dialog-reader.component';
import { ProductService } from '../../../../services/book-list.service';

@Component({
  selector: 'app-list',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private _service = inject(ProductService);
  private _cdr = inject(ChangeDetectorRef);
  private _dialogService = inject(MatDialog);

  data: any[] = [];
  previewUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {
    this._fetchList();
  }

  private async _fetchList() {
    const response = await lastValueFrom(this._service.getMany());
    if(!response) return;
    console.log(response);
    this.data = response.data;
    this._cdr.markForCheck();
  }

  async onClick(id: string) {
    this._dialogService.open(DialogReaderComponent, {
      minWidth: '70vw',
      height: '80vh',
      disableClose: true,
      data: {
        id
      },
    }).afterClosed();
  }
}
