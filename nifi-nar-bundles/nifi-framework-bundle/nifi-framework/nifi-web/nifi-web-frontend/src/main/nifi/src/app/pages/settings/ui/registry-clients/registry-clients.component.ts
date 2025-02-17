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

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    selectRegistryClient,
    selectRegistryClientIdFromRoute,
    selectRegistryClientsState,
    selectSingleEditedRegistryClient
} from '../../state/registry-clients/registry-clients.selectors';
import {
    loadRegistryClients,
    navigateToEditRegistryClient,
    openConfigureRegistryClientDialog,
    openNewRegistryClientDialog,
    promptRegistryClientDeletion,
    selectClient
} from '../../state/registry-clients/registry-clients.actions';
import { RegistryClientEntity, RegistryClientsState } from '../../state/registry-clients';
import { initialState } from '../../state/registry-clients/registry-clients.reducer';
import { selectUser } from '../../../../state/user/user.selectors';
import { NiFiState } from '../../../../state';
import { filter, switchMap, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'registry-clients',
    templateUrl: './registry-clients.component.html',
    styleUrls: ['./registry-clients.component.scss']
})
export class RegistryClients implements OnInit {
    registryClientsState$ = this.store.select(selectRegistryClientsState);
    selectedRegistryClientId$ = this.store.select(selectRegistryClientIdFromRoute);
    currentUser$ = this.store.select(selectUser);

    constructor(private store: Store<NiFiState>) {
        this.store
            .select(selectSingleEditedRegistryClient)
            .pipe(
                filter((id: string) => id != null),
                switchMap((id: string) =>
                    this.store.select(selectRegistryClient(id)).pipe(
                        filter((entity) => entity != null),
                        take(1)
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe((entity) => {
                if (entity) {
                    this.store.dispatch(
                        openConfigureRegistryClientDialog({
                            request: {
                                registryClient: entity
                            }
                        })
                    );
                }
            });
    }

    ngOnInit(): void {
        this.store.dispatch(loadRegistryClients());
    }

    isInitialLoading(state: RegistryClientsState): boolean {
        // using the current timestamp to detect the initial load event
        return state.loadedTimestamp == initialState.loadedTimestamp;
    }

    openNewRegistryClientDialog(): void {
        this.store.dispatch(openNewRegistryClientDialog());
    }

    refreshRegistryClientListing(): void {
        this.store.dispatch(loadRegistryClients());
    }

    selectRegistryClient(entity: RegistryClientEntity): void {
        this.store.dispatch(
            selectClient({
                request: {
                    id: entity.id
                }
            })
        );
    }

    configureRegistryClient(entity: RegistryClientEntity): void {
        this.store.dispatch(
            navigateToEditRegistryClient({
                id: entity.id
            })
        );
    }

    deleteRegistryClient(entity: RegistryClientEntity): void {
        this.store.dispatch(
            promptRegistryClientDeletion({
                request: {
                    registryClient: entity
                }
            })
        );
    }
}
