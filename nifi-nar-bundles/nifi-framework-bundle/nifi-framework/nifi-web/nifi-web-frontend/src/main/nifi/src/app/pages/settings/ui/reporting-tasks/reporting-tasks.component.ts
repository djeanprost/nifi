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
import { ReportingTaskEntity, ReportingTasksState } from '../../state/reporting-tasks';
import {
    selectReportingTaskIdFromRoute,
    selectReportingTasksState
} from '../../state/reporting-tasks/reporting-tasks.selectors';
import {
    loadReportingTasks,
    openNewReportingTaskDialog,
    promptReportingTaskDeletion,
    selectReportingTask,
    startReportingTask,
    stopReportingTask
} from '../../state/reporting-tasks/reporting-tasks.actions';
import { initialState } from '../../state/reporting-tasks/reporting-tasks.reducer';
import { selectUser } from '../../../../state/user/user.selectors';
import { NiFiState } from '../../../../state';

@Component({
    selector: 'reporting-tasks',
    templateUrl: './reporting-tasks.component.html',
    styleUrls: ['./reporting-tasks.component.scss']
})
export class ReportingTasks implements OnInit {
    reportingTaskState$ = this.store.select(selectReportingTasksState);
    selectedReportingTaskId$ = this.store.select(selectReportingTaskIdFromRoute);
    currentUser$ = this.store.select(selectUser);

    constructor(private store: Store<NiFiState>) {}

    ngOnInit(): void {
        this.store.dispatch(loadReportingTasks());
    }

    isInitialLoading(state: ReportingTasksState): boolean {
        // using the current timestamp to detect the initial load event
        return state.loadedTimestamp == initialState.loadedTimestamp;
    }

    openNewReportingTaskDialog(): void {
        this.store.dispatch(openNewReportingTaskDialog());
    }

    refreshReportingTaskListing(): void {
        this.store.dispatch(loadReportingTasks());
    }

    selectReportingTask(entity: ReportingTaskEntity): void {
        this.store.dispatch(
            selectReportingTask({
                request: {
                    reportingTask: entity
                }
            })
        );
    }

    deleteReportingTask(entity: ReportingTaskEntity): void {
        this.store.dispatch(
            promptReportingTaskDeletion({
                request: {
                    reportingTask: entity
                }
            })
        );
    }

    startReportingTask(entity: ReportingTaskEntity): void {
        this.store.dispatch(
            startReportingTask({
                request: {
                    reportingTask: entity
                }
            })
        );
    }

    stopReportingTask(entity: ReportingTaskEntity): void {
        this.store.dispatch(
            stopReportingTask({
                request: {
                    reportingTask: entity
                }
            })
        );
    }
}
