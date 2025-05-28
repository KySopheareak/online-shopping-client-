import {
    HttpClient,
    HttpErrorResponse,
    HttpEventType,
    HttpHeaders,
    HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    catchError,
    filter,
    finalize,
    map,
    Observable,
    throwError,
} from 'rxjs';
import { APIResponseCodeEnum } from '../types/enums/api-response-code.enum';
import { RequestParam } from '../types/request-param';
import { BaseResponse } from '../types/response/base.response';
import { LoadingService } from './loading.service';
import { SnackbarService } from './snackbar.service';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpClientService {
    constructor(
        private http: HttpClient,
        private loadingService: LoadingService,
        private snackbarService: SnackbarService
    ) {}

    getUrl(path: string, queryParams?: { [key: string]: any }) {
        let arr = path.split('/').filter((v) => v);
        arr.unshift(environment.api_url);
        const urlPath = arr.join('/');
        if (queryParams) {
            this.clean(queryParams, true);
            const url = new URL(urlPath);
            for (const [key, value] of Object.entries(queryParams)) {
                url.searchParams.append(key, value);
            }
            return url.toString();
        }

        return urlPath;
    }

    get<T>(path: string, request: RequestParam = {}) {
        const url = this.getUrl(path);
        this.clean(request.data, true);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        return this.http.get<T>(url, { params: request.data }).pipe(
            catchError((err) =>
                this.handleHttpError(err, request.isAlertError)
            ),
            finalize(() => this.finalizeRequest(request.isLoading))
        );
    }

    getBlob(path: string, request: RequestParam = {}) {
        const url = this.getUrl(path);
        this.clean(request.data, true);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        return this.http
            .get(url, { params: request.data, responseType: 'blob' })
            .pipe(
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    getJSON<T>(path: string, request: RequestParam = {}) {
        const url = this.getUrl(path);
        this.clean(request.data, true);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .get<BaseResponse>(url, { params: request.data, headers })
            .pipe(
                map((res) => this.handleResponse<T>(res)),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    post<T>(path: string, request: RequestParam) {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        request.data = this.toFormData(request.data);
        return this.http
            .post<BaseResponse>(url, request.data, { headers })
            .pipe(
                map((res) => this.handleResponse<T>(res)),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    postJSON<T>(path: string, request: RequestParam) {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post<BaseResponse>(url, request.data, { headers })
            .pipe(
                map((res) => this.handleResponse<T>(res)),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    postFile<T>(path: string, request: RequestParam) {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data;boundary=abc');
        request.data = this.toFormData(request.data);
        return this.http
            .post<BaseResponse>(url, request.data, { headers })
            .pipe(
                map((res) => this.handleResponse<T>(res) as T),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    patchFile<T>(path: string, request: RequestParam): Observable<T> {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data;boundary=abc');
        request.data = this.toFormData(request.data);
        return this.http
            .patch<BaseResponse>(url, request.data, { headers })
            .pipe(
                map((res) => this.handleResponse<T>(res) as T),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    postFileProgress<T>(
        path: string,
        request: RequestParam
    ): Observable<number | T> {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data;boundary=abc');
        request.data = this.toFormData(request.data);
        return this.http
            .post<T>(url, request.data, {
                headers,
                reportProgress: true,
                responseType: 'json',
                observe: 'events',
            })
            .pipe(
                filter(
                    (res) =>
                        res.type == HttpEventType.UploadProgress ||
                        res.type == HttpEventType.Response
                ),
                map((res) => {
                    if (res.type == HttpEventType.UploadProgress) {
                        return Math.round(
                            (res.loaded / (res.total || 0)) * 100
                        );
                    } else {
                        return (res as HttpResponse<T>).body || ({} as T);
                    }
                }),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    patchFileProgress<T>(
        path: string,
        request: RequestParam
    ): Observable<number | T> {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data;boundary=abc');
        request.data = this.toFormData(request.data);
        return this.http
            .patch<T>(url, request.data, {
                headers,
                reportProgress: true,
                responseType: 'json',
                observe: 'events',
            })
            .pipe(
                filter(
                    (res) =>
                        res.type == HttpEventType.UploadProgress ||
                        res.type == HttpEventType.Response
                ),
                map((res) => {
                    if (res.type == HttpEventType.UploadProgress) {
                        return Math.round(
                            (res.loaded / (res.total || 0)) * 100
                        );
                    } else {
                        return (res as HttpResponse<T>).body || ({} as T);
                    }
                }),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    patch<T>(path: string, request: RequestParam) {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        request.data = this.toFormData(request.data);
        return this.http
            .patch<BaseResponse>(url, request.data, { headers })
            .pipe(
                map((res) => this.handleResponse<T>(res)),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    patchJSON<T>(path: string, request: RequestParam) {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .patch<BaseResponse>(url, request.data, { headers })
            .pipe(
                map((res) => this.handleResponse<T>(res)),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    deleteJSON<T>(path: string, request: RequestParam = {}) {
        const url = this.getUrl(path);
        this.clean(request.data);
        if (request.isLoading) {
            this.loadingService.setLoading(true);
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete<BaseResponse>(url, { headers, params: request.data })
            .pipe(
                map((res) => this.handleResponse<T>(res)),
                catchError((err) =>
                    this.handleHttpError(err, request.isAlertError)
                ),
                finalize(() => this.finalizeRequest(request.isLoading))
            );
    }

    private clean(obj: any, isCleanQuery = false) {
        for (const propName in obj) {
            if (
                obj[propName] === undefined ||
                (isCleanQuery && obj[propName] === null)
            ) {
                delete obj[propName];
            } else if (obj[propName] instanceof Date) {
                (obj[propName] as Date).setMilliseconds(0);
                obj[propName] = (obj[propName] as Date).toISOString();
            } else if (
                typeof obj[propName] == 'object' &&
                !(obj[propName] instanceof File)
            ) {
                this.clean(obj[propName]);
            }
        }
    }

    private handleResponse<T>(res: any) {
        return res;
    }

    private handleHttpError(
        error: HttpErrorResponse,
        is_alert_error: boolean = true
    ) {
        if (is_alert_error) {
            if (error.status === APIResponseCodeEnum.server_error) {
                this.snackbarService.error({
                    message: error.error.message,
                });
            } else {
                let errMessage: string = '';
                if (error?.error?.errors) {
                    if (error?.error?.errors?.length > 0) {
                        errMessage = error.error.errors[0].msg;
                    }
                }
                this.snackbarService.error({
                    message:
                        error?.error?.message ?? errMessage ?? error?.message,
                });
            }
        }
        return throwError(() => error?.error?.message ?? error?.message);
    }

    private finalizeRequest(is_loading?: boolean) {
        if (is_loading) {
            this.loadingService.setLoading(false);
        }
    }

    private toFormData(formValue: any) {
        const formData = new FormData();
        const fileKeys: string[] = [];

        for (const key of Object.keys(formValue)) {
            const value = formValue[key];

            if (value instanceof File) {
                fileKeys.push(key); // Defer appending files to the end
                continue;
            }

            if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value)); // Convert objects to JSON strings

            } else {
                formData.append(key, value); // Append other values directly
            }
        }

        // Append files at the end
        for (const key of fileKeys) {
            formData.append(key, formValue[key]);
        }

        return formData;
    }
}
