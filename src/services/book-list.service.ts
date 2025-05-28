import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProductService extends BaseCrudService<any> {
    constructor() {
        super();
        this.path = '/products';
    }

    getImageUrl(id: string): Observable<any> {
      return this.httpClientService.getJSON(`/file/${id}`, {
        isAlertError: true,
      });
    }
}
