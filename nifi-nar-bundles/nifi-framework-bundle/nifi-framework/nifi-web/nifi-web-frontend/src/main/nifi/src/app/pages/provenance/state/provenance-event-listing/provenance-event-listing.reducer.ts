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

import { createReducer, on } from '@ngrx/store';
import { ProvenanceEventListingState } from './index';
import {
    clearProvenanceRequest,
    loadProvenanceOptionsSuccess,
    pollProvenanceQuerySuccess,
    provenanceApiError,
    saveProvenanceRequest,
    submitProvenanceQuery,
    submitProvenanceQuerySuccess
} from './provenance-event-listing.actions';

export const initialState: ProvenanceEventListingState = {
    options: null,
    request: null,
    provenance: null,
    saving: false,
    loadedTimestamp: '',
    error: null,
    status: 'pending'
};

export const provenanceEventListingReducer = createReducer(
    initialState,
    on(loadProvenanceOptionsSuccess, (state, { response }) => ({
        ...state,
        options: response.provenanceOptions
    })),
    on(submitProvenanceQuery, (state) => ({
        ...state,
        status: 'loading' as const
    })),
    on(submitProvenanceQuerySuccess, pollProvenanceQuerySuccess, (state, { response }) => ({
        ...state,
        provenance: response.provenance,
        loadedTimestamp: response.provenance.results.generated,
        error: null,
        status: 'success' as const
    })),
    on(saveProvenanceRequest, (state, { request }) => ({
        ...state,
        request
    })),
    on(clearProvenanceRequest, (state) => ({
        ...state,
        request: null
    })),
    on(provenanceApiError, (state, { error }) => ({
        ...state,
        saving: false,
        error,
        status: 'error' as const
    }))
);
