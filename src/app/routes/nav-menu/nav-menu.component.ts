import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import { AuthService } from '../../../services/auth.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  imports: [RouterOutlet, MatIconModule, MatMenuModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {
  private _router = inject(Router);
  private _dialogService = inject(MatDialog);
  private _authService = inject(AuthService);

  onReloadPage() {
    this._router.navigate(['']);
  }

}
