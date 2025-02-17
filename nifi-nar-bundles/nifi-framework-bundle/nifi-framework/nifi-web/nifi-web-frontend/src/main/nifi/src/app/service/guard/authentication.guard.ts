/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { AuthStorage } from '../auth-storage.service';
import { take } from 'rxjs';
import { UserService } from '../user.service';
import { Store } from '@ngrx/store';
import { UserState } from '../../state/user';
import { loadUserSuccess } from '../../state/user/user.actions';
import { selectUserState } from '../../state/user/user.selectors';

export const authenticationGuard: CanMatchFn = (route, state) => {
    const authStorage: AuthStorage = inject(AuthStorage);
    const authService: AuthService = inject(AuthService);
    const userService: UserService = inject(UserService);
    const store: Store<UserState> = inject(Store<UserState>);

    const handleAuthentication: Promise<boolean> = new Promise((resolve) => {
        if (authStorage.hasToken()) {
            resolve(true);
        } else {
            authService
                .kerberos()
                .pipe(take(1))
                .subscribe({
                    next: (jwt: string) => {
                        // Use Expiration from JWT for tracking authentication status
                        const sessionExpiration: string | null = authService.getSessionExpiration(jwt);
                        if (sessionExpiration) {
                            authStorage.setToken(sessionExpiration);
                        }

                        resolve(true);
                    },
                    error: (error) => {
                        authService
                            .ticketExpiration()
                            .pipe(take(1))
                            .subscribe({
                                next: (accessTokenExpirationEntity: any) => {
                                    const accessTokenExpiration: any =
                                        accessTokenExpirationEntity.accessTokenExpiration;
                                    // Convert ISO 8601 string to session expiration in seconds
                                    const expiration: number = Date.parse(accessTokenExpiration.expiration);
                                    const expirationSeconds: number = expiration / 1000;
                                    const sessionExpiration: number = Math.round(expirationSeconds);
                                    authStorage.setToken(String(sessionExpiration));

                                    resolve(true);
                                },
                                error: (error) => {
                                    resolve(false);
                                }
                            });
                    }
                });
        }
    });

    return new Promise<boolean>((resolve) => {
        handleAuthentication.finally(() => {
            store
                .select(selectUserState)
                .pipe(take(1))
                .subscribe((userState) => {
                    if (userState.status == 'pending') {
                        userService
                            .getUser()
                            .pipe(take(1))
                            .subscribe({
                                next: (response) => {
                                    // store the loaded user
                                    store.dispatch(
                                        loadUserSuccess({
                                            response: {
                                                user: response
                                            }
                                        })
                                    );

                                    if (authStorage.hasToken()) {
                                        resolve(true);
                                    } else {
                                        authService
                                            .accessConfig()
                                            .pipe(take(1))
                                            .subscribe({
                                                next: (response) => {
                                                    if (response.config.supportsLogin) {
                                                        // Set default expiration when authenticated to enable logout status
                                                        const expiration: string = authService.getDefaultExpiration();
                                                        authStorage.setToken(expiration);
                                                    }
                                                    resolve(true);
                                                },
                                                error: (error) => {
                                                    window.location.href = './login';
                                                    resolve(false);
                                                }
                                            });
                                    }
                                },
                                error: (error) => {
                                    // there is no anonymous access and we don't know this user - open the login page which handles login/registration/etc
                                    if (error.status === 401) {
                                        authStorage.removeToken();
                                        window.location.href = './login';
                                    }
                                    resolve(false);
                                }
                            });
                    } else {
                        resolve(true);
                    }
                });
        });
    });
};
