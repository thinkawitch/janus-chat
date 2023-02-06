import { xstate } from '../../imports.js';
const { createMachine, assign, sendUpdate, actions } = xstate;
const { send, sendParent, choose, pure } = actions;

/*export default function createJanusTextRoomService(withConfig) {
    const machine = withConfig ? createMachine().withConfig(withConfig) : createMachine();
    return machine;
}*/

export default function createTextRoomMachine() {
    return createMachine({
        id: 'textRoom',
        predictableActionArguments: true,
        initial: 'idle',
        context: { // context is defined in parent invoke
            attached: false, // 1. attach to plugin
            setup: false, // 2. set up data channel
            joined: false, // 3. join the room
            roomId: undefined,
            pinRequired: undefined,
            pinIncorrect: undefined,
            pin: undefined,
            errors: [],
        },
        states: {
            idle: {
                on: {
                    START: 'howToStart',
                    STOP: { actions: 'stopTextRoom' }, // not used when invoke service
                }
            },
            howToStart: {
                always: [
                    { target: 'attaching', cond: 'notAttached' },
                    { target: 'attached.settingUp', cond: 'notSetup' },
                    { target: 'attached.setupSuccess.joining', cond: 'notJoined' },
                    { target: 'attached.setupSuccess.joined' },
                ],
            },
            attaching: {
                meta: { message: 'attaching to textroom plugin' },
                entry: ['attachToTextRoomPlugin'],
                on: {
                    ATTACHED: 'attached',
                    ERROR: {
                        target: 'attachFailed',
                        actions: ['addError']
                    },
                }
            },
            attachFailed: {
                meta: { message: 'failed to attach to textroom plugin' },
                type: 'final',
                entry: ['sendTextRoomContext', 'onAttachFailed', 'onTextRoomPluginAttachFailed']
            },
            attached: {
                meta: { message: 'attached to textroom plugin' },
                entry: [
                    (context, event) => { console.log('=============== attached entry', event) },
                    assign(_ => ({ attached: true })),
                    'sendTextRoomContext',
                    //sendUpdate(),
                    'onTextRoomPluginAttachSuccess'
                ],
                exit: [ assign(_ => ({ attached: false })), 'sendTextRoomContext' ],
                on: {
                    DETACH: {
                        target: 'idle',
                        actions: [ assign(_ => ({ attached: false })), 'sendTextRoomContext' ]
                    },
                },
                initial: 'settingUp',
                states: {
                    settingUp: {
                        entry: ['setupTextRoomPlugin'],
                        on: {
                            DATA_OPENED: {
                                target: 'setupSuccess',
                            },
                            ERROR: {
                                target: 'setupFailed',
                                actions: ['addError']
                            },
                        }
                    },
                    setupFailed: {
                        meta: { message: 'failed to setup textroom plugin' },
                        type: 'final',
                        entry: ['sendTextRoomContext', 'onSetupFailed', 'onTextRoomPluginSetupFailed']
                    },
                    setupSuccess: {
                        entry: [ assign(_ => ({ setup: true })), 'sendTextRoomContext', 'onTextRoomPluginSetupSuccess' ],
                        initial: 'joining',
                        states: {
                            joining: {
                                entry: ['joinTextRoom'],
                                on: {
                                    JOINED: {
                                        target: 'joined',
                                        actions: ['onTextRoomPluginJoinSuccess']
                                    },
                                    ERROR: {
                                        target: 'joinFailed',
                                        actions: ['addError', 'onTextRoomPluginJoinFailed']
                                    }
                                }
                            },
                            joinFailed: {
                                meta: { message: 'failed to join the room' },
                                type: 'final',
                            },
                            joined: {
                                meta: { message: 'joined the room' },
                                entry: [ assign(_ => ({ joined: true })), 'sendTextRoomContext' ],
                                exit: [ assign(_ => ({ joined: false })), 'sendTextRoomContext' ],
                                on: {
                                    DESTROYED: {
                                        target: 'joinFailed',
                                        actions: ['addError', 'sendTextRoomContext', 'onTextRoomPluginRoomDestroyed'],
                                    }
                                }
                            }
                        }
                    }
                }
            },
        }
    }, {
        actions: {
            // internal actions
            addError: assign({
                errors: (context, event) => {
                    console.log('textRoom.addError event', event);
                    return [...context.errors, event.payload];
                }
            }),
            stopTextRoom: pure((context, event) => {
                console.log('__stopTextRoom__');
            }),
            onAttachFailed: sendParent((context) => ({ type: 'TEXTROOM_ATTACH_FAILED', payload: context.errors.at(-1)})),
            sendTextRoomContext: sendParent((context) => ({ type: 'TEXTROOM_CONTEXT', payload: context})),
            onSetupFailed: sendParent((context) => ({ type: 'TEXTROOM_SETUP_FAILED', payload: context.errors.at(-1)})),
            // external actions
            // step 1
            attachToTextRoomPlugin: () => {},
            onTextRoomPluginAttachSuccess: () => {},
            onTextRoomPluginAttachFailed: () => {},
            // step 2
            setupTextRoomPlugin: () => {},
            onTextRoomPluginSetupSuccess: () => {},
            onTextRoomPluginSetupFailed: () => {},
            // step 3
            joinTextRoom: () => {},
            onTextRoomPluginJoinSuccess: () => {},
            onTextRoomPluginJoinFailed: () => {},
            onTextRoomPluginRoomDestroyed: () => {},
        },
        guards: {
            notAttached: context => !context.attached,
            notSetup: context => !context.attached,
            notJoined: context => !context.joined,
        },
    })
}

