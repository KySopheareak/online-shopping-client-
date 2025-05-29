import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageEnum } from '../types/enums/local-storage.enum';
import { HttpClientService } from './http-client.service';
import { LocalStorageService } from './local-storage.service';
import { Login } from '../types/login';
import { UserToken } from '../types/user-token';
import { User } from '../types/user';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    authChange$: BehaviorSubject<boolean>;
    title: string = '';
    isAuth: boolean;
    userId: string | null;
    forceChangePassword;

    private refreshTokenPath = '/auth/user/renew-token';
    constructor(
        private router: Router,
        private httpClientService: HttpClientService,
        private localStorageService: LocalStorageService
    ) {
        this.authChange$ = new BehaviorSubject<boolean>(this._isAuth);
        this.isAuth = this._isAuth;
        this.userId = this._userId;
        this.forceChangePassword = this._forceChangePassword;
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (this.isAuth != this._isAuth) {
                    this.markStatusChange();
                }
            }
        });
    }

    login(data: Login) {
        return this.httpClientService.postJSON<any>('/user/login', {
                data,
                isLoading: true,
            }).pipe(map((res) => {
                  this.localStorageService.set(LocalStorageEnum.Token, res.data.token);
                  this.localStorageService.set(LocalStorageEnum.UserId, res.data.user._id!);
                  return res;
                })
            );
    }

    refreshToken() {
        return this.httpClientService.postJSON<UserToken>(
            this.refreshTokenPath,
            {}
        );
    }

    isRefreshTokenUrl(url: string) {
        return url == this.httpClientService.getUrl(this.refreshTokenPath);
    }

    logout() {
        this.localStorageService.delete(LocalStorageEnum.Token);
        this.localStorageService.delete(LocalStorageEnum.RefreshToken);
        this.localStorageService.delete(LocalStorageEnum.UserId);
        this.markStatusChange();
        this.router.navigateByUrl('/login');
    }

    getProfile() {
        return this.httpClientService.getJSON<User>('/auth/profile').pipe(
            map((user) => {
                this.localStorageService.set(
                    LocalStorageEnum.ForceChangePassword,
                    !!user.forceChangePassword ? '1' : ''
                );
                this.markForceChangePasswordChange();
                return user;
            })
        );
    }

    signUp(data: Login) {
        return this.httpClientService.postJSON<any>('/user/register', {
            data,
            isLoading: true,
        }).pipe(
            map((res) => {
                this.localStorageService.set(LocalStorageEnum.Token, res.data.token);
                this.localStorageService.set(LocalStorageEnum.UserId, res.data.user._id!);
                return res;
            })
        );
    }

    changePassowrd(oldPassword: string, newPassword: string) {
        return this.httpClientService
            .postJSON('/auth/password', {
                data: { password: oldPassword, newPassword: newPassword },
                isAlertError: true,
                isLoading: true,
            })
            .pipe(
                map((res) => {
                    this.localStorageService.set(
                        LocalStorageEnum.ForceChangePassword,
                        ''
                    );
                    this.markForceChangePasswordChange();
                    return res;
                })
            );
    }

    private markForceChangePasswordChange() {
        this.forceChangePassword = this._forceChangePassword;
        if (this.forceChangePassword) {
            this.router.navigateByUrl('/change-password');
        }
    }

    private markStatusChange() {
        this.isAuth = this._isAuth;
        this.userId = this._userId;
        this.forceChangePassword = this._forceChangePassword;
        this.authChange$.next(this._isAuth);
    }

    get _isAuth(): boolean {
        return this.localStorageService.get(LocalStorageEnum.Token) ||
            this.localStorageService.get(LocalStorageEnum.RefreshToken)
            ? true
            : false;
    }

    private get _userId(): string | null {
        return this.localStorageService.get(LocalStorageEnum.UserId);
    }

    private get _forceChangePassword(): boolean {
        return !!this.localStorageService.get(
            LocalStorageEnum.ForceChangePassword
        );
    }
}
