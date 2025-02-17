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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TransformActions from './transform.actions';
import { map, tap, withLatestFrom } from 'rxjs';
import { Storage } from '../../../../service/storage.service';
import { selectCurrentProcessGroupId } from '../flow/flow.selectors';
import { Store } from '@ngrx/store';
import { CanvasState } from '../index';
import { CanvasView } from '../../service/canvas-view.service';
import { BirdseyeView } from '../../service/birdseye-view.service';

@Injectable()
export class TransformEffects {
    private static readonly VIEW_PREFIX: string = 'nifi-view-';

    constructor(
        private actions$: Actions,
        private store: Store<CanvasState>,
        private storage: Storage,
        private canvasView: CanvasView,
        private birdseyeView: BirdseyeView
    ) {}

    transformComplete$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.transformComplete),
                map((action) => action.transform),
                withLatestFrom(this.store.select(selectCurrentProcessGroupId)),
                tap(([transform, processGroupId]) => {
                    const name: string = TransformEffects.VIEW_PREFIX + processGroupId;

                    // create the item to store
                    const item = {
                        scale: transform.scale,
                        translateX: transform.translate.x,
                        translateY: transform.translate.y
                    };

                    // store the item
                    this.storage.setItem(name, item);
                })
            ),
        { dispatch: false }
    );

    restoreViewport$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.restoreViewport),
                withLatestFrom(this.store.select(selectCurrentProcessGroupId)),
                tap(([action, processGroupId]) => {
                    try {
                        // see if we can restore the view position from storage
                        const name: string = TransformEffects.VIEW_PREFIX + processGroupId;
                        const item = this.storage.getItem(name);

                        // ensure the item is valid
                        if (item) {
                            if (isFinite(item.scale) && isFinite(item.translateX) && isFinite(item.translateY)) {
                                // restore previous view
                                this.canvasView.transform([item.translateX, item.translateY], item.scale);
                            }
                        }
                    } catch (e) {
                        // likely could not parse item... ignoring
                    }
                })
            ),
        { dispatch: false }
    );

    translate$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.translate),
                map((action) => action.translate),
                tap((translate: [number, number]) => {
                    this.canvasView.translate(translate);
                })
            ),
        { dispatch: false }
    );

    refreshBirdseye$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.refreshBirdseyeView),
                tap(() => {
                    this.birdseyeView.refresh();
                })
            ),
        { dispatch: false }
    );

    zoomIn$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.zoomIn),
                tap(() => {
                    this.canvasView.zoomIn();
                })
            ),
        { dispatch: false }
    );

    zoomOut$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.zoomOut),
                tap(() => {
                    this.canvasView.zoomOut();
                })
            ),
        { dispatch: false }
    );

    zoomFit$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.zoomFit),
                tap(() => {
                    this.canvasView.fit();
                })
            ),
        { dispatch: false }
    );

    zoomActual$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TransformActions.zoomActual),
                tap(() => {
                    this.canvasView.actualSize();
                })
            ),
        { dispatch: false }
    );
}
