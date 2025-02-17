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

import { TestBed } from '@angular/core/testing';

import { LabelManager } from './label-manager.service';
import { CanvasState } from '../../state';
import { flowFeatureKey } from '../../state/flow';
import * as fromFlow from '../../state/flow/flow.reducer';
import { transformFeatureKey } from '../../state/transform';
import * as fromTransform from '../../state/transform/transform.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { selectFlowState } from '../../state/flow/flow.selectors';
import { selectTransform } from '../../state/transform/transform.selectors';
import { controllerServicesFeatureKey } from '../../state/controller-services';
import * as fromControllerServices from '../../state/controller-services/controller-services.reducer';
import { selectUser } from '../../../../state/user/user.selectors';
import * as fromUser from '../../../../state/user/user.reducer';
import { parameterFeatureKey } from '../../state/parameter';
import * as fromParameter from '../../state/parameter/parameter.reducer';

describe('LabelManager', () => {
    let service: LabelManager;

    beforeEach(() => {
        const initialState: CanvasState = {
            [flowFeatureKey]: fromFlow.initialState,
            [transformFeatureKey]: fromTransform.initialState,
            [controllerServicesFeatureKey]: fromControllerServices.initialState,
            [parameterFeatureKey]: fromParameter.initialState
        };

        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    initialState,
                    selectors: [
                        {
                            selector: selectFlowState,
                            value: initialState[flowFeatureKey]
                        },
                        {
                            selector: selectTransform,
                            value: initialState[transformFeatureKey]
                        },
                        {
                            selector: selectUser,
                            value: fromUser.initialState.user
                        }
                    ]
                })
            ]
        });
        service = TestBed.inject(LabelManager);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
