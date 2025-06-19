import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private countsSubject = new BehaviorSubject<{ [id: string]: number }>({});
  counts$ = this.countsSubject.asObservable();

  // Call this to update the cart (add, remove, etc.)
  setCount(id: string, count: number) {
    const current = { ...this.countsSubject.value };
    current[id] = count;
    this.countsSubject.next(current);
  }

  increment(id: string) {
    const current = { ...this.countsSubject.value };
    current[id] = (current[id] || 0) + 1;
    this.countsSubject.next(current);
  }

  decrement(id: string) {
    const current = { ...this.countsSubject.value };
    console.log('-------: ', current);

    if ((current[id] || 0) > 1) {
      current[id] = current[id] - 1;
    } else {
      delete current[id]; // Remove item if count is 0 or less
    }
    this.countsSubject.next(current);
  }

  getTotalCount(counts: { [id: string]: number }): number {
    return Object.values(counts).reduce((sum, c) => sum + (c || 0), 0);
  }
}
