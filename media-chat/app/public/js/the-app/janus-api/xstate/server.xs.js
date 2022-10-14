import { xstate } from '../../imports.js';
const { createMachine, interpret, assign, spawn, actions } = xstate;
const { after, pure, send, sendParent } = actions;
import createTextRoomMachine from './textroom.xs.js';
import createVideoRoomMachine from './videoroom.xs.js';


/*
 1. connect to server
    -> 2. attach to textroom plugin -> 2.2. setup -> 2.3. join textroom
    -> 3. attach to videoroom plugin
        (2+3) -> operational
*/

export default function createJanusMachineService(serverConfig, textRoomConfig) {
    const textRoomMachine = textRoomConfig
        ? createTextRoomMachine().withConfig(textRoomConfig)
        : createTextRoomMachine();

    const videoRoomMachine = null;

    const janusMachine = serverConfig
        ? createJanusMachine(textRoomMachine, videoRoomMachine).withConfig(serverConfig)
        : createJanusMachine(textRoomMachine, videoRoomMachine);

    const janusService = interpret(janusMachine, { /*devTools: true*/ });
    janusService.onTransition(state => {
        console.log('JMS.onTransition', 'state.value', state.value, 'state', state);
    });
    return janusService;
}

function getTextRoomDefaultContext() {
    return {
        attached: false,
        setup: false,
        joined: false,
        roomId: undefined,
        pinRequired: undefined,
        pinIncorrect: undefined,
        pin: undefined,
        errors: [],
    }
}

function createJanusMachine(textRoomMachine, videoRoomMachine) {

    return createMachine({
        id: 'janusServer',
        predictableActionArguments: true,
        initial: 'idle',
        context: {
            // server
            connected: false,
            disconnected: false,
            newCleanConnect: false, // when disconnected, then connected but session lost and need new clean connect
            restoringConnect: false, // now in redux, should move here
            shouldConnectAfterDisconnect: false, // when we
            retries: 0,
            maxRetries: 5,
            errors: [],
            // textRoom plugin
            textRoom: getTextRoomDefaultContext(),
            // videoRoom plugin
            videoRoom: {}
        },
        states: {
            idle: {
                on: {
                    ROOM_ID: { actions: 'setRoomId' },
                    CONNECT: 'connecting',
                },
            },
            connecting: {
                meta: { message: 'connecting to server' },
                entry: ['connectToJanusServer'],
                on: {
                    CONNECTED: 'connected',
                    CONNECT_ERROR: {
                        target: 'connectError',
                        actions: ['addError']
                    },
                },
            },
            connectError: {
                on: {
                    RETRY_CONNECT: [
                        {
                            actions: ['increaseRetries'],
                            target: 'tryConnectWithDelay',
                            cond: 'shouldRetryToConnect',
                        },
                        {
                            target: 'connectFailed'
                        },
                    ],
                    NEW_CONNECT: {
                        // new clean connect when janus.reconnect failed
                        actions: [ assign(context => ({ newCleanConnect: true, retries: 0 })) ],
                        target: 'connecting'
                    },
                },
            },
            tryConnectWithDelay: {
                meta: { message: 'will try to connect to server after delay' },
                after: { RECONNECT_DELAY: 'connecting' }
            },
            connectFailed: {
                meta: { message: 'failed to connect to server, stop the app' },
                type: 'final',
                entry: ['onJanusServerConnectFailed'],
            },
            connected: {
                meta: { message: 'connected to janus server' },
                invoke: [{ // invoked service gets destroyed on state exit
                    id: 'textRoom',
                    src: textRoomMachine,
                    data: (context, event) => {
                        // why called 2 times ?
                        console.log('invoke_textRoom_data', {...context.textRoom}, event);
                        return { ...context.textRoom };
                    }
                }],
                entry: ['onServerConnected', 'onJanusServerConnectSuccess', 'startTextRoomPlugin'],
                exit: [(context) => { console.log('__exit_from_connected') }],
                on: {
                    DISCONNECT: {
                        //target: 'idle',
                        //actions: ['onServerDisconnected', 'disconnectFromJanusServer'],
                        target: 'disconnecting',
                    },
                    CONNECT_ERROR: {
                        target: 'connectError',
                        actions: ['addError', 'onServerConnectError', 'onJanusServerLostConnection']
                    },
                    TEXTROOM_CONTEXT: {
                        actions: ['onTextRoomContext'],
                    },
                    TEXTROOM_ATTACH_FAILED: {
                        actions: ['addError'],
                    },
                    TEXTROOM_SETUP_FAILED: {
                        target: 'disconnecting',
                        actions: ['addError'],
                    },
                    TEXTROOM_ERROR_AND_CONNECT: {
                        target: 'disconnectingToConnect',
                        actions: ['addError'],
                    },
                },
            },
            disconnecting: {
                meta: { message: 'wait while janus.js destroy the session then idle' },
                entry: ['disconnectFromJanusServer'],
                // disconnectFromJanusServer() called BEFORE the transition finished
                // we are still in 'connected' but `action` sends(DISCONNECTED) here
                on: {
                    DISCONNECTED: {
                        target: 'idle',
                        actions: ['onServerDisconnected']
                    },
                }
            },
            disconnectingToConnect: {
                meta: { message: 'wait while janus.js destroy the session then connecting' },
                entry: ['disconnectFromJanusServer'],
                on: {
                    DISCONNECTED: {
                        target: 'connecting', // connect again
                        actions: ['onServerDisconnected']
                    },
                }
            },
            /*fatalError: {
                meta: { message: 'fatal error, should start again from scratch' },
                initial: 'disconnecting',
                states: {
                    disconnecting: {

                    },
                    disconnected: {

                    }
                }
            },*/
        },
    }, {
        actions: {
            // inner actions
            setRoomId: assign({
                textRoom: (context, event) => ({
                    ...context.textRoom,
                    roomId: event.payload
                })
            }),
            increaseRetries: assign({
                retries: context => context.retries + 1,
            }),
            onServerConnected: assign({
                connected: true,
                disconnected: false,
                newCleanConnect: false,
                retries: 0,
                errors: [],
                //textRoom: (context) => ({...context.textRoom, attached: true}) // for test
            }),
            onServerConnectError: assign({
                connected: false,
                disconnected: true,
                retries: -1, // the fix to make all tries for reconnect
                textRoom: getTextRoomDefaultContext(),
            }),
            onServerDisconnected: assign({
                connected: false,
                disconnected: true,
                retries: 0,
                textRoom: getTextRoomDefaultContext(),
            }),
            addError: assign({
                errors: (context, event) => {
                    return [...context.errors, event.payload];
                }
            }),
            // external actions
            connectToJanusServer: () => {},
            onJanusServerConnectSuccess: () => {},
            onJanusServerConnectFailed: () => {},
            onJanusServerLostConnection: () => {},
            disconnectFromJanusServer: () => {},
            // textRoom plugin
            startTextRoomPlugin: send({ type: 'START' }, { to: 'textRoom' }),
            stopTextRoomPlugin: send({ type: 'STOP' }, { to: 'textRoom' }),
            onTextRoomContext: assign({
                textRoom: (context, event) => {
                    console.log('onTextRoomContext changed from', context.textRoom, 'to', event.payload)
                    return event.payload;
                },
                /*newCleanConnect: (context, event) => {
                    // we should reset value if we were in "newCleanConnect" state and the room is joined
                    let newVal = context.newCleanConnect;
                    if (context.newCleanConnect === true && event.payload.joined === true) {
                        newVal = false;
                    }
                    return newVal;
                },*/
            }),
        },
        guards: {
            shouldRetryToConnect: context => context.retries < (context.maxRetries - 1),
            textRoomAlreadyJoined: context => context.textRoom.joined,
        },
        delays: {
            RECONNECT_DELAY: 1000,
        }
    });
}

