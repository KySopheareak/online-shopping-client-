import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../../../../services/product-list.service';
import { lastValueFrom } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-reader',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './dialog-reader.component.html',
  styleUrl: './dialog-reader.component.scss'
})
export class DialogReaderComponent implements OnInit {

  private _service = inject(ProductService);
  id = inject(MAT_DIALOG_DATA)?.id;
  data: any = null;

  ngOnInit(): void {
    this._fetchData();
  }

  private async _fetchData() {
    const response = await lastValueFrom(this._service.getById(this.id));
    console.log('RESPONSE', response);
    if(!response) return;
    this.data = response?.data;
  }

  isArray(): boolean {
    return Array.isArray(this.data?.full_story?.content);
  }

}
