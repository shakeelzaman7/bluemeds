import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AuthService } from "./auth.service";
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return from(this.auth.hasToken()).pipe(
            switchMap((result) => {
                let headers = request.headers.set("Accept", "application/json");
                if(!headers.has("Content-Type"))
                    headers.append("Content-Type", "application/json");
                headers = headers.append(
                    "tz",
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                );

                if (result) {
                    const token = this.auth.token;
                    headers = headers.append(
                        "Authorization",
                        token.token_type + " " + token.token
                    );
                }

                const requestClone = request.clone({
                    headers,
                });
                return next.handle(requestClone);
            })
        );
    }
}
