import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {
  loginForm!: UntypedFormGroup;

  constructor(private _loginService: AuthService, private _router: Router) {
    this.loginForm = new UntypedFormGroup({
      username: new UntypedFormControl(null),
      email: new UntypedFormControl(null),
      password: new UntypedFormControl(null),
    });
  }

  ngAfterViewInit() {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton?.addEventListener('click', () => {
      container?.classList.add("right-panel-active");
    });

    signInButton?.addEventListener('click', () => {
      container?.classList.remove("right-panel-active");
    });
  }

  async onSubmit() {
    const formData = this.loginForm.value;
    let username = formData.username;
    let password = formData.password;
    const response = await lastValueFrom(this._loginService.login({username: username, password: password}));
    if(!response) {
      this._router.navigate(['/login']);
      return;
    }
    this._router.navigate(['/list']);
  }

  async onSignUp() {
    const formData = this.loginForm.value;
    let username = formData.username;
    let email = formData.email;
    let password = formData.password;

    const response = await lastValueFrom(this._loginService.signUp({username: username, email: email, password: password}));
    if(!response) {
      this._router.navigate(['/login']);
      return;
    }
    this._router.navigate(['/list']);
  }
}
