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

import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CanvasState } from '../../../state';
import { Observable, Subject } from 'rxjs';
import {
    centerSelectedComponent,
    deleteComponents,
    enterProcessGroup,
    getParameterContextsAndOpenGroupComponentsDialog,
    leaveProcessGroup,
    moveComponents,
    navigateToComponent,
    navigateToControllerServicesForProcessGroup,
    navigateToEditComponent,
    navigateToEditCurrentProcessGroup,
    navigateToProvenanceForComponent,
    reloadFlow,
    replayLastProvenanceEvent
} from '../../../state/flow/flow.actions';
import { CanvasUtils } from '../../../service/canvas-utils.service';
import { DeleteComponentRequest, MoveComponentRequest } from '../../../state/flow';
import { ComponentType } from '../../../../../state/shared';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

export interface ContextMenuItemDefinition {
    isSeparator?: boolean;
    condition?: Function;
    clazz?: string;
    text?: string;
    subMenuId?: string;
    action?: Function;
}

export interface ContextMenuDefinition {
    id: string;
    menuItems: ContextMenuItemDefinition[];
}

@Component({
    selector: 'fd-context-menu',
    standalone: true,
    templateUrl: './context-menu.component.html',
    imports: [NgForOf, AsyncPipe, CdkMenu, CdkMenuItem, NgIf, CdkMenuTrigger],
    styleUrls: ['./context-menu.component.scss']
})
export class ContextMenu implements OnInit {
    readonly VERSION_MENU = {
        id: 'version',
        menuItems: [
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsStartFlowVersioning
                    return false;
                },
                clazz: 'fa fa-upload',
                text: 'Start version control',
                action: function (store: Store<CanvasState>) {
                    // TODO - saveFlowVersion
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsCommitFlowVersion
                    return false;
                },
                clazz: 'fa fa-upload',
                text: 'Commit local changes',
                action: function (store: Store<CanvasState>) {
                    // TODO - saveFlowVersion
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsForceCommitFlowVersion
                    return false;
                },
                clazz: 'fa fa-upload',
                text: 'Commit local changes',
                action: function (store: Store<CanvasState>) {
                    // TODO - forceSaveFlowVersion
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - hasLocalChanges
                    return false;
                },
                clazz: 'fa',
                text: 'Show local changes',
                action: function (store: Store<CanvasState>) {
                    // TODO - showLocalChanges
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - hasLocalChanges
                    return false;
                },
                clazz: 'fa fa-undo',
                text: 'Revert local changes',
                action: function (store: Store<CanvasState>) {
                    // TODO - revertLocalChanges
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsChangeFlowVersion
                    return false;
                },
                clazz: 'fa',
                text: 'Change version',
                action: function (store: Store<CanvasState>) {
                    // TODO - changeFlowVersion
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsStopFlowVersioning
                    return false;
                },
                clazz: 'fa',
                text: 'Stop version control',
                action: function (store: Store<CanvasState>) {
                    // TODO - stopVersionControl
                }
            }
        ]
    };

    readonly PROVENANCE_REPLAY = {
        id: 'provenance-replay',
        menuItems: [
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.canReplayComponentProvenance(selection);
                },
                clazz: 'fa',
                text: 'All nodes',
                action: function (store: Store<CanvasState>, selection: any) {
                    const selectionData = selection.datum();
                    store.dispatch(
                        replayLastProvenanceEvent({
                            request: {
                                componentId: selectionData.id,
                                nodes: 'ALL'
                            }
                        })
                    );
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.canReplayComponentProvenance(selection);
                },
                clazz: 'fa',
                text: 'Primary node',
                action: function (store: Store<CanvasState>, selection: any) {
                    const selectionData = selection.datum();
                    store.dispatch(
                        replayLastProvenanceEvent({
                            request: {
                                componentId: selectionData.id,
                                nodes: 'PRIMARY'
                            }
                        })
                    );
                }
            }
        ]
    };

    readonly UPSTREAM_DOWNSTREAM = {
        id: 'upstream-downstream',
        menuItems: [
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.hasUpstream(selection);
                },
                clazz: 'icon',
                text: 'Upstream',
                action: function (store: Store<CanvasState>) {
                    // TODO - showUpstream
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.hasDownstream(selection);
                },
                clazz: 'icon',
                text: 'Downstream',
                action: function (store: Store<CanvasState>) {
                    // TODO - showDownstream
                }
            }
        ]
    };

    readonly ALIGN = {
        id: 'align',
        menuItems: [
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canAlign
                    return false;
                },
                clazz: 'fa fa-align-center fa-rotate-90',
                text: 'Horizontally',
                action: function (store: Store<CanvasState>) {
                    // TODO - alignHorizontal
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canAlign
                    return false;
                },
                clazz: 'fa fa-align-center',
                text: 'Vertically',
                action: function (store: Store<CanvasState>) {
                    // TODO - alignVertical
                }
            }
        ]
    };

    readonly DOWNLOAD = {
        id: 'download',
        menuItems: [
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsDownloadFlow
                    return false;
                },
                clazz: 'fa',
                text: 'Without external services',
                action: function (store: Store<CanvasState>) {
                    // TODO - downloadFlowWithoutExternalServices
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsDownloadFlow
                    return false;
                },
                clazz: 'fa',
                text: 'With external services',
                action: function (store: Store<CanvasState>) {
                    // TODO - downloadFlowWithExternalServices
                }
            }
        ]
    };

    readonly ROOT_MENU: ContextMenuDefinition = {
        id: 'root',
        menuItems: [
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.emptySelection(selection);
                },
                clazz: 'fa fa-refresh',
                text: 'Refresh',
                action: function (store: Store<CanvasState>) {
                    store.dispatch(reloadFlow());
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isNotRootGroupAndEmptySelection(selection);
                },
                clazz: 'fa fa-level-up',
                text: 'Leave group',
                action: function (store: Store<CanvasState>) {
                    store.dispatch(leaveProcessGroup());
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isConfigurable(selection);
                },
                clazz: 'fa fa-gear',
                text: 'Configure',
                action: function (store: Store<CanvasState>, selection: any) {
                    if (selection.empty()) {
                        store.dispatch(navigateToEditCurrentProcessGroup());
                    } else {
                        const selectionData = selection.datum();
                        store.dispatch(
                            navigateToEditComponent({
                                request: {
                                    type: selectionData.type,
                                    id: selectionData.id
                                }
                            })
                        );
                    }
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isProcessGroup(selection) || selection.empty();
                },
                clazz: 'fa fa-list',
                text: 'Controller Services',
                action: function (store: Store<CanvasState>, selection: any, canvasUtils: CanvasUtils) {
                    if (selection.empty()) {
                        store.dispatch(
                            navigateToControllerServicesForProcessGroup({
                                request: {
                                    id: canvasUtils.getProcessGroupId()
                                }
                            })
                        );
                    } else {
                        const selectionData = selection.datum();
                        store.dispatch(
                            navigateToControllerServicesForProcessGroup({
                                request: {
                                    id: selectionData.id
                                }
                            })
                        );
                    }
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - hasDetails
                    return false;
                },
                clazz: 'fa fa-gear',
                text: 'View configuration',
                action: function (store: Store<CanvasState>, selection: any) {
                    // TODO - showDetails... Can we support read only and configurable in the same dialog/form?
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - hasParameterContext
                    return false;
                },
                clazz: 'fa',
                text: 'Parameters',
                action: function (store: Store<CanvasState>) {
                    // TODO - open parameter context
                }
            },
            {
                isSeparator: true
            },
            {
                clazz: 'fa',
                text: 'Version',
                subMenuId: this.VERSION_MENU.id
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isProcessGroup(selection);
                },
                clazz: 'fa fa-sign-in',
                text: 'Enter group',
                action: function (store: Store<CanvasState>, selection: any) {
                    const d: any = selection.datum();

                    // enter the selected group
                    store.dispatch(
                        enterProcessGroup({
                            request: {
                                id: d.id
                            }
                        })
                    );
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - isRunnable
                    return false;
                },
                clazz: 'fa fa-play',
                text: 'Start',
                action: function (store: Store<CanvasState>) {
                    // TODO - start
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - isStoppable
                    return false;
                },
                clazz: 'fa fa-stop',
                text: 'Stop',
                action: function (store: Store<CanvasState>) {
                    // TODO - stop
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - isRunnableProcessor
                    return false;
                },
                clazz: 'fa fa-caret-right',
                text: 'Run Once',
                action: function (store: Store<CanvasState>) {
                    // TODO - runOnce
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canTerminate
                    return false;
                },
                clazz: 'fa fa-hourglass-end',
                text: 'Terminate',
                action: function (store: Store<CanvasState>) {
                    // TODO - terminate
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canEnable
                    return false;
                },
                clazz: 'fa fa-flash',
                text: 'Enable',
                action: function (store: Store<CanvasState>) {
                    // TODO - enable
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canDisable
                    return false;
                },
                clazz: 'icon icon-enable-false',
                text: 'Disable',
                action: function (store: Store<CanvasState>) {
                    // TODO - disable
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canStartTransmission
                    return false;
                },
                clazz: 'fa fa-bullseye',
                text: 'Enable transmission',
                action: function (store: Store<CanvasState>) {
                    // TODO - enableTransmission
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canStopTransmission
                    return false;
                },
                clazz: 'icon icon-transmit-false',
                text: 'Disable transmission',
                action: function (store: Store<CanvasState>) {
                    // TODO - disableTransmission
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isProcessGroup(selection);
                },
                clazz: 'fa fa-flash',
                text: 'Enable all controller services',
                action: function (store: Store<CanvasState>) {
                    // TODO - enableAllControllerServices
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.emptySelection(selection);
                },
                clazz: 'fa fa-flash',
                text: 'Enable all controller services',
                action: function (store: Store<CanvasState>) {
                    // TODO - enableAllControllerServices
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isProcessGroup(selection);
                },
                clazz: 'icon icon-enable-false',
                text: 'Disable all controller services',
                action: function (store: Store<CanvasState>) {
                    // TODO - disableAllControllerServices
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.emptySelection(selection);
                },
                clazz: 'icon icon-enable-false',
                text: 'Disable all controller services',
                action: function (store: Store<CanvasState>) {
                    // TODO - disableAllControllerServices
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.canAccessComponentProvenance(selection);
                },
                clazz: 'icon icon-provenance',
                // imgStyle: 'context-menu-provenance',
                text: 'View data provenance',
                action: function (store: Store<CanvasState>, selection: any) {
                    const selectionData = selection.datum();
                    store.dispatch(
                        navigateToProvenanceForComponent({
                            id: selectionData.id
                        })
                    );
                }
            },
            {
                clazz: 'fa fa-repeat',
                text: 'Replay last event',
                subMenuId: this.PROVENANCE_REPLAY.id
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - supportsStats
                    return false;
                },
                clazz: 'fa fa-area-chart',
                text: 'View status history',
                action: function (store: Store<CanvasState>) {
                    // TODO - showStats
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - isStatefulProcessor
                    return false;
                },
                clazz: 'fa fa-tasks',
                text: 'View state',
                action: function (store: Store<CanvasState>) {
                    // TODO - viewState
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canListQueue
                    return false;
                },
                clazz: 'fa fa-list',
                text: 'List queue',
                action: function (store: Store<CanvasState>) {
                    // TODO - listQueue
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - hasUsage
                    return false;
                },
                clazz: 'fa fa-book',
                text: 'View usage',
                action: function (store: Store<CanvasState>) {
                    // TODO - showUsage
                }
            },
            {
                clazz: 'icon icon-connect',
                text: 'View connections',
                subMenuId: this.UPSTREAM_DOWNSTREAM.id
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isRemoteProcessGroup(selection);
                },
                clazz: 'fa fa-refresh',
                text: 'Refresh remote',
                action: function (store: Store<CanvasState>) {
                    // TODO - refreshRemoteFlow
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isRemoteProcessGroup(selection);
                },
                clazz: 'fa fa-cloud',
                text: 'Manage remote ports',
                action: function (store: Store<CanvasState>) {
                    // TODO - remotePorts
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canManagePolicies
                    return false;
                },
                clazz: 'fa fa-key',
                text: 'Manage access policies',
                action: function (store: Store<CanvasState>) {
                    // TODO - managePolicies
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canChangeProcessorVersion
                    return false;
                },
                clazz: 'fa fa-exchange',
                text: 'Change version',
                action: function (store: Store<CanvasState>) {
                    // TODO - changeVersion
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isConnection(selection);
                },
                clazz: 'fa fa-long-arrow-left',
                text: 'Go to source',
                action: function (store: Store<CanvasState>, selection: any, canvasUtils: CanvasUtils) {
                    const selectionData = selection.datum();
                    const remoteConnectableType: string = canvasUtils.getConnectableTypeForSource(
                        ComponentType.RemoteProcessGroup
                    );

                    // if the source is remote
                    if (selectionData.sourceType == remoteConnectableType) {
                        store.dispatch(
                            navigateToComponent({
                                request: {
                                    id: selectionData.sourceGroupId,
                                    type: ComponentType.RemoteProcessGroup
                                }
                            })
                        );
                    } else {
                        const type: ComponentType | null = canvasUtils.getComponentTypeForSource(
                            selectionData.sourceType
                        );

                        if (type) {
                            store.dispatch(
                                navigateToComponent({
                                    request: {
                                        id: selectionData.sourceId,
                                        processGroupId: selectionData.sourceGroupId,
                                        type
                                    }
                                })
                            );
                        }
                    }
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isConnection(selection);
                },
                clazz: 'fa fa-long-arrow-right',
                text: 'Go to destination',
                action: function (store: Store<CanvasState>, selection: any, canvasUtils: CanvasUtils) {
                    const selectionData = selection.datum();
                    const remoteConnectableType: string = canvasUtils.getConnectableTypeForDestination(
                        ComponentType.RemoteProcessGroup
                    );

                    // if the source is remote
                    if (selectionData.destinationType == remoteConnectableType) {
                        store.dispatch(
                            navigateToComponent({
                                request: {
                                    id: selectionData.destinationGroupId,
                                    type: ComponentType.RemoteProcessGroup
                                }
                            })
                        );
                    } else {
                        const type: ComponentType | null = canvasUtils.getComponentTypeForDestination(
                            selectionData.destinationType
                        );

                        if (type) {
                            store.dispatch(
                                navigateToComponent({
                                    request: {
                                        id: selectionData.destinationId,
                                        processGroupId: selectionData.destinationGroupId,
                                        type
                                    }
                                })
                            );
                        }
                    }
                }
            },
            {
                isSeparator: true
            },
            {
                clazz: 'fa',
                text: 'Align',
                subMenuId: this.ALIGN.id
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canMoveToFront
                    return false;
                },
                clazz: 'fa fa-clone',
                text: 'Bring to front',
                action: function (store: Store<CanvasState>) {
                    // TODO - toFront
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return selection.size() === 1 && !canvasUtils.isConnection(selection);
                },
                clazz: 'fa fa-crosshairs',
                text: 'Center in view',
                action: function (store: Store<CanvasState>) {
                    store.dispatch(centerSelectedComponent());
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - isColorable
                    return false;
                },
                clazz: 'fa fa-paint-brush',
                text: 'Change color',
                action: function (store: Store<CanvasState>) {
                    // TODO - fillColor
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isRemoteProcessGroup(selection);
                },
                clazz: 'fa fa-external-link',
                text: 'Go to',
                action: function (store: Store<CanvasState>) {
                    // TODO - openUri
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isNotRootGroup();
                },
                clazz: 'fa fa-arrows',
                text: 'Move to parent group',
                action: function (store: Store<CanvasState>, selection: any, canvasUtils: CanvasUtils) {
                    const components: MoveComponentRequest[] = [];
                    selection.each(function (d: any) {
                        components.push({
                            id: d.id,
                            type: d.type,
                            uri: d.uri,
                            entity: d
                        });
                    });

                    // move the selection into the group
                    store.dispatch(
                        moveComponents({
                            request: {
                                components,
                                // @ts-ignore
                                groupId: canvasUtils.getParentProcessGroupId()
                            }
                        })
                    );
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isDisconnected(selection);
                },
                clazz: 'icon icon-group',
                text: 'Group',
                action: function (store: Store<CanvasState>, selection: any, canvasUtils: CanvasUtils) {
                    const moveComponents: MoveComponentRequest[] = [];
                    selection.each(function (d: any) {
                        moveComponents.push({
                            id: d.id,
                            type: d.type,
                            uri: d.uri,
                            entity: d
                        });
                    });

                    // move the selection into the group
                    store.dispatch(
                        getParameterContextsAndOpenGroupComponentsDialog({
                            request: {
                                moveComponents,
                                position: canvasUtils.getOrigin(selection)
                            }
                        })
                    );
                }
            },
            {
                isSeparator: true
            },
            {
                clazz: 'fa',
                text: 'Download flow definition',
                subMenuId: this.DOWNLOAD.id
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - isCopyable
                    return false;
                },
                clazz: 'fa fa-copy',
                text: 'Copy',
                action: function (store: Store<CanvasState>) {
                    // TODO - copy
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - isPastable
                    return false;
                },
                clazz: 'fa fa-paste',
                text: 'Paste',
                action: function (store: Store<CanvasState>) {
                    // TODO - paste
                }
            },
            {
                isSeparator: true
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    // TODO - canEmptyQueue
                    return false;
                },
                clazz: 'fa fa-minus-circle',
                text: 'Empty queue',
                action: function (store: Store<CanvasState>) {
                    // TODO - emptyQueue
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.isProcessGroup(selection);
                },
                clazz: 'fa fa-minus-circle',
                text: 'Empty all queues',
                action: function (store: Store<CanvasState>) {
                    // TODO - emptyAllQueues in selected PG
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.emptySelection(selection);
                },
                clazz: 'fa fa-minus-circle',
                text: 'Empty all queues',
                action: function (store: Store<CanvasState>) {
                    // TODO - emptyAllQueues in current PG
                }
            },
            {
                condition: function (canvasUtils: CanvasUtils, selection: any) {
                    return canvasUtils.areDeletable(selection);
                },
                clazz: 'fa fa-trash',
                text: 'Delete',
                action: function (store: Store<CanvasState>, selection: any) {
                    if (selection.size() === 1) {
                        const selectionData = selection.datum();
                        store.dispatch(
                            deleteComponents({
                                request: [
                                    {
                                        id: selectionData.id,
                                        type: selectionData.type,
                                        uri: selectionData.uri,
                                        entity: selectionData
                                    }
                                ]
                            })
                        );
                    } else {
                        const requests: DeleteComponentRequest[] = [];
                        selection.each(function (d: any) {
                            requests.push({
                                id: d.id,
                                type: d.type,
                                uri: d.uri,
                                entity: d
                            });
                        });
                        store.dispatch(
                            deleteComponents({
                                request: requests
                            })
                        );
                    }
                }
            }
        ]
    };

    private allMenus: Map<string, ContextMenuDefinition>;

    @Input() menuId: string | undefined;
    @ViewChild('menu', { static: true }) menu!: TemplateRef<any>;

    private showFocused: Subject<boolean> = new Subject();
    showFocused$: Observable<boolean> = this.showFocused.asObservable();

    constructor(
        private store: Store<CanvasState>,
        private canvasUtils: CanvasUtils
    ) {
        this.allMenus = new Map<string, ContextMenuDefinition>();
        this.allMenus.set(this.ROOT_MENU.id, this.ROOT_MENU);
        this.allMenus.set(this.PROVENANCE_REPLAY.id, this.PROVENANCE_REPLAY);
        this.allMenus.set(this.VERSION_MENU.id, this.VERSION_MENU);
        this.allMenus.set(this.UPSTREAM_DOWNSTREAM.id, this.UPSTREAM_DOWNSTREAM);
        this.allMenus.set(this.ALIGN.id, this.ALIGN);
        this.allMenus.set(this.DOWNLOAD.id, this.DOWNLOAD);
    }

    getMenuItems(menuId: string | undefined): ContextMenuItemDefinition[] {
        if (menuId) {
            const menuDefinition: ContextMenuDefinition | undefined = this.allMenus.get(menuId);

            if (menuDefinition) {
                const selection = this.canvasUtils.getSelection();

                // find all applicable menu items for the current selection
                let applicableMenuItems = menuDefinition.menuItems.filter((menuItem: ContextMenuItemDefinition) => {
                    // include if the condition matches
                    if (menuItem.condition) {
                        return menuItem.condition(this.canvasUtils, selection);
                    }

                    // include if the sub menu has items
                    if (menuItem.subMenuId) {
                        return this.getMenuItems(menuItem.subMenuId).length > 0;
                    }

                    return true;
                });

                // remove any extra separators
                applicableMenuItems = applicableMenuItems.filter(
                    (menuItem: ContextMenuItemDefinition, index: number) => {
                        if (menuItem.isSeparator && index > 0) {
                            // cannot have two consecutive separators
                            return !applicableMenuItems[index - 1].isSeparator;
                        }

                        return true;
                    }
                );

                return applicableMenuItems.filter((menuItem: ContextMenuItemDefinition, index: number) => {
                    if (menuItem.isSeparator) {
                        // a separator cannot be first
                        if (index === 0) {
                            return false;
                        }

                        // a separator cannot be last
                        if (index >= applicableMenuItems.length - 1) {
                            return false;
                        }
                    }

                    return true;
                });
            } else {
                return [];
            }
        }

        return [];
    }

    hasSubMenu(menuItemDefinition: ContextMenuItemDefinition): boolean {
        return !!menuItemDefinition.subMenuId;
    }

    keydown(event: KeyboardEvent): void {
        // TODO - Currently the first item in the context menu is auto focused. By default, this is rendered with an
        // outline. This appears to be an issue with the cdkMenu/cdkMenuItem so we are working around it by manually
        // overriding styles.
        this.showFocused.next(true);
    }

    ngOnInit(): void {
        this.showFocused.next(false);
    }

    menuItemClicked(menuItem: ContextMenuItemDefinition, event: MouseEvent) {
        if (menuItem.action) {
            const selection = this.canvasUtils.getSelection();
            menuItem.action(this.store, selection, this.canvasUtils, event);
        }
    }
}
