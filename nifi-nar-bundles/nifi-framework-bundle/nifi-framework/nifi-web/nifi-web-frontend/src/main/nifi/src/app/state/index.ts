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

import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import { UserState, userFeatureKey } from './user';
import { userReducer } from './user/user.reducer';
import { extensionTypesFeatureKey, ExtensionTypesState } from './extension-types';
import { extensionTypesReducer } from './extension-types/extension-types.reducer';
import { aboutFeatureKey, AboutState } from './about';
import { aboutReducer } from './about/about.reducer';
import { statusHistoryFeatureKey, StatusHistoryState } from './status-history';
import { statusHistoryReducer } from './status-history/status-history.reducer';

export interface NiFiState {
    router: RouterReducerState;
    [userFeatureKey]: UserState;
    [extensionTypesFeatureKey]: ExtensionTypesState;
    [aboutFeatureKey]: AboutState;
    [statusHistoryFeatureKey]: StatusHistoryState;
}

export const rootReducers: ActionReducerMap<NiFiState> = {
    router: routerReducer,
    [userFeatureKey]: userReducer,
    [extensionTypesFeatureKey]: extensionTypesReducer,
    [aboutFeatureKey]: aboutReducer,
    [statusHistoryFeatureKey]: statusHistoryReducer
};
