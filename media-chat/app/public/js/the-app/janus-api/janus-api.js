import { server, iceServers, opaqueId } from './../config.js';
import { randomString } from '../utils.js';
import createJanusMachineService from './xstate/server.xs.js';
import {
    addJanusError,
    tryConnect, connected, disconnected, connectFailed,
    tryTextRoomJoin, textRoomJoined, textRoomFailed, textRoomDestroyed,
    setTextRoomPinRequired, setTextRoomPinValue, setTextRoomPinIncorrect, setTextRoomJoiningWithPin,
} from '../redux-toolkit/slices/janus-slice.js';
import { MESSAGE_TYPE_GENERAL, MESSAGE_TYPE_SYSTEM } from '../constants.js';
import {
    addMessage,
    addParticipant, addParticipants,
    removeParticipant,
    selectParticipantByFrom
} from '../redux-toolkit/slices/text-room-slice.js';
import { setUserOnline, setUserOffline, selectUserByFrom } from '../redux-toolkit/slices/users-slice.js';
import { askExternalUser } from '../redux-toolkit/actions/users-actions.js';
import { selectSettings } from '../redux-toolkit/slices/settings-slice.js';


let janus = null;
let textRoom = null;
let videoRoom = null;
const transactions = []; // callbacks for some transactions

// redux
let store = null;
let dispatch = null;
let getState = null;

// state machine
let janusMachineService;
function getTextRoomService() {
    return janusMachineService.children.get('textRoom');
}
function sendToTextRoomService(...args) {
    const trs = janusMachineService?.children?.get('textRoom');
    if (trs) {
        trs.send(...args);
    } else {
        console.error('[sendToTextRoomService] trs absent');
    }
}

const ua = window.navigator.userAgent.toLowerCase();
const isFirefox = ua.indexOf('firefox') !== -1;
// const isIos = !!ua.match(/ipad|iphone|ipod/) && ua.indexOf('windows phone') === -1;

window.getJMS = () => janusMachineService;
window.xsServer = () => {
    return janusMachineService.getSnapshot();
}
window.xsTextRoom = () => {
    return janusMachineService.getSnapshot().children?.textRoom?.getSnapshot();
}

export function startJanus(theStore) {
    store = theStore;
    dispatch = theStore.dispatch;
    getState = theStore.getState;

    const serverConfig = {
        actions: {
            connectToJanusServer: (context, event) => {
                const connectTryNumber = context.retries + 1;
                const newCleanConnect = context.newCleanConnect;
                console.log('[startJanus] connectToJanusServer', 'try #' + connectTryNumber, 'newCleanConnect', newCleanConnect, context, event);
                dispatch(tryConnect({ connectTryNumber, newCleanConnect }));
                if (context.disconnected && !context.newCleanConnect) {
                    // do reconnect
                    console.log('[startJanus] reconnectToJanusServer');
                    reconnectToJanusServer();
                } else {
                    // first time
                    if (janus) {
                        // not the first time, reset
                        console.log('[startJanus] janus.destroy({ cleanupHandles: true })');
                        janus.destroy({ cleanupHandles: true });
                    }
                    connectToJanusServer();
                    // crutch for firefox, user still here, crutch not working
                    //isFirefox ? setTimeout(connectToJanusServer, 500) : connectToJanusServer();
                }
            },
            onJanusServerConnectFailed: (context, event, actionMeta) => {
                console.log('[startJanus] onJanusServerConnectFailed', context, event);
                janusMachineService.stop(); // the end, app should display final fatal error
                dispatch(connectFailed());
                janus.destroy({ cleanupHandles: true });
            },
            onJanusServerConnectSuccess: (context) => {
                console.log('[startJanus] onJanusServerConnectSuccess', context);
                dispatch(connected());
            },
            onJanusServerLostConnection: (context) => {
                console.log('[startJanus] onJanusServerLostConnection', context);
                dispatch(disconnected());
                if (textRoom) {
                    console.log('[startJanus] textRoom.detach 1');
                    textRoom.detach({ noRequest: true });
                    console.log('[startJanus] textRoom.detach 2');
                }
            },
            disconnectFromJanusServer: (context, event) => {
                console.log('[startJanus] disconnectFromJanusServer', context, event);
                console.log('[startJanus] disconnectFromJanusServer', janusMachineService.getSnapshot());
                janus.destroy({
                    cleanupHandles: true,
                    success: () => {
                        console.log('[startJanus] disconnectFromJanusServer success');
                        dispatch(disconnected());
                        // connect again in server.xs disconnecting.DISCONNECTED
                        // crutch, give time for transition to finish
                        setTimeout(() => {
                            janusMachineService.send({ type: 'DISCONNECTED' });
                        }, 100);
                    },
                    error: (error) => {
                        console.error('[startJanus] disconnectFromJanusServer error', error);
                    },
                });
            },
        }
    }
    const textRoomConfig = {
        actions: {
            // step 1
            attachToTextRoomPlugin: (context, event) => {
                console.log('[startJanus] attachToTextRoomPlugin', context, event);
                dispatch(tryTextRoomJoin());
                attachToTextRoomPlugin();
            },
            onTextRoomPluginAttachFailed: (context, event) => {
                console.log('[startJanus] onTextRoomPluginAttachFailed', context, event);
                dispatch(textRoomFailed());
                janusMachineService.send({ type: 'DISCONNECT' }); // full stop
            },
            onTextRoomPluginAttachSuccess: (context, event) => {
                console.log('[startJanus] onTextRoomPluginAttachSuccess', context, event);
            },
            // step 2
            setupTextRoomPlugin: (context, event) => {
                console.log('[startJanus] setupTextRoomPlugin', context, event);
                setupTextRoomPlugin();
            },
            onTextRoomPluginSetupFailed: (context, event) => {
                console.log('[startJanus] onTextRoomPluginSetupFailed', context, event);
                dispatch(textRoomFailed());
                janusMachineService.send({ type: 'DISCONNECT' }); // full stop
            },
            onTextRoomPluginSetupSuccess: (context, event) => {
                console.log('[startJanus] onTextRoomPluginSetupSuccess', context, event);
            },
            // step 3
            joinTextRoom: (context, event) => {
                console.log('[startJanus] joinTextRoom', context, event);
                joinTextRoom();
                // crutch for firefox, to minify user already in room when doing page reload, not fixes the problem full
                //isFirefox ? setTimeout(joinTextRoom, 500) : joinTextRoom();
            },
            onTextRoomPluginJoinFailed: (context, event) => {
                console.log('[startJanus] onTextRoomPluginJoinFailed', context, event);
                /*if (getState().janus.restoringConnect && event.error === 'Username already taken') {
                    // we tried to re-join the room, but server thinks we are still in
                    // buggy
                    janusMachineService.send({ type: 'TEXTROOM_ERROR', payload: event.error });
                    janusMachineService.send({ type: 'NEW_CONNECT' });
                } else {
                    dispatch(textRoomFailed());
                }*/
                dispatch(textRoomFailed());
                janusMachineService.send({ type: 'DISCONNECT' }); // full stop
            },
            onTextRoomPluginJoinSuccess: (context, event) => {
                console.log('[startJanus] onTextRoomPluginJoinSuccess', context, event);
                dispatch(textRoomJoined());
            },
            onTextRoomPluginRoomDestroyed: (context, event) => {
                console.log('[startJanus] onTextRoomPluginRoomDestroyed', context, event);
                const errorText = 'Room stopped!';
                dispatch(addMessage({
                    type: MESSAGE_TYPE_SYSTEM,
                    text: errorText,
                    date: new Date().toISOString()
                }));
                dispatch(addJanusError(errorText));
                dispatch(textRoomDestroyed());
                janusMachineService.send({ type: 'DISCONNECT' }); // full stop
            },
        }
    }

    //setTimeout(() => {
    janusMachineService = createJanusMachineService(serverConfig, textRoomConfig);
    janusMachineService.start();
    janusMachineService.send({ type: 'ROOM_ID', payload: getState().textRoom.roomId });
    janusMachineService.send('CONNECT');
    //},5000)
}

function stopJanus() {
    console.log('stopJanus()')
    // full stop,
    // i.e. on ICE failed/disconnected while ws connection to server still active
    janusMachineService.stop();
    janus.destroy({
        cleanupHandles: true,
        success: () => {
            console.log('[stopJanus] success');
            // start again from scratch
        },
        error: (error) => {
            console.error('[stopJanus] error', error);
        },
    });
}

function connectToJanusServer() {
    console.log('connectToJanusServer');

    function gwcSuccess() {
        console.log('[connectToJanusServer] gwcSuccess');
        janusMachineService.send('CONNECTED');
    }

    function gwcError(error) {
        console.error('[connectToJanusServer] gwcError', error);
        dispatch(addJanusError(error));
        janusMachineService.send({ type: 'CONNECT_ERROR', payload: error })
        const errorsToRetry = [
            'Lost connection to the server (is it down?)',
            'Error connecting to the Janus WebSockets server: Is the server down?',
            'Error connecting to any of the provided Janus servers: Is the server down?',
        ]
        if (errorsToRetry.indexOf(error) >= 0) {
            janusMachineService.send({ type: 'RETRY_CONNECT' });
        }
    }

    function gwcDestroyed() {
        console.warn('[connectToJanusServer] gwcDestroyed');
    }

    const gatewayCallbacks = {
        server,
        iceServers,
        success: gwcSuccess,
        error: gwcError,
        destroyed: gwcDestroyed,
        //destroyOnUnload: false, // true by default
        //keepAlivePeriod: 25000,
        //notifyDestroyed: true, // true by default
    };

    function initDone() {
        console.log('[connectToJanusServer] initDone');
        janus = new Janus(gatewayCallbacks);
    }

    const initOptions = {
        debug: 'all',
        callback: initDone,
    };
    Janus.init(initOptions);
}

function reconnectToJanusServer() {
    console.log('reconnectToJanusServer');
    janus.reconnect({
        success: () => {
            Janus.log('[reconnectToJanusServer] success');
            janusMachineService.send('CONNECTED');
        },
        error: (error) => {
            Janus.warn('[reconnectToJanusServer] error', error);
            janusMachineService.send({ type: 'CONNECT_ERROR', payload: error });
            if (String(error).substring(0, 15) === 'No such session') {
                // do full reconnect
                janus.destroy({
                    cleanupHandles: true,
                    success: () => {
                        Janus.log('[reconnectToJanusServer][error] destroy success');
                        // need clean connect here !!!
                        janusMachineService.send({ type: 'NEW_CONNECT' });
                    },
                    error: (reason) => {
                        Janus.log('[reconnectToJanusServer][error] destroy error', reason);
                    },
                });
            } else {
                janusMachineService.send({ type: 'RETRY_CONNECT' });
            }

        }
    });
}


function attachToTextRoomPlugin() {
    console.log('attachToTextRoomPlugin');
    // attach to TextRoom plugin
    janus.attach({
        plugin: 'janus.plugin.textroom',
        opaqueId,
        success: (pluginHandle) => {
            console.log('[attachToTextRoomPlugin] success');
            textRoom = pluginHandle;
            //textRoom.send({ message: { request: 'setup' } });
            sendToTextRoomService({ type: 'ATTACHED' });
        },
        error: (error) => {
            console.error('[attachToTextRoomPlugin] error', error);
            dispatch(addJanusError(error));
            sendToTextRoomService({ type: 'ERROR', payload: error });
        },
        iceState: (state) => {
            Janus.log('[attachToTextRoomPlugin] iceState', state);

            const errorMessage = `ICE ${state} (interactive connectivity establishment)`;
            if (state === 'failed' || state === 'disconnected') {
                Janus.error('[attachToTextRoomPlugin] ICE ' + state);
                dispatch(addJanusError(errorMessage));
                sendToTextRoomService({ type: 'ERROR', payload: errorMessage }); // => onTextRoomPluginJoinFailed
            }
            // do we really need to handle the ice errors in textroom ?
            /* firefox:
            *      when `disconnected` the chat continues to work sometime
            *      but sometime not, in 20 seconds `failed` follows then we do reconnect
            *  chrome:
            *      `failed` NOT fires after `disconnected`
            */
            const { janus: { textRoomJoining, textRoomJoined } } = getState();
            if (textRoomJoining) {
                // 1. establishing connection
                if (state === 'failed') {
                    // do nothing here
                }
            } else if (textRoomJoined) {
                // 2. connection was established, but now changed
                if (state === 'failed' || state === 'disconnected') {
                    janusMachineService.send({ type: 'TEXTROOM_ERROR_AND_CONNECT', payload: errorMessage }); // => disconnectFromJanusServer
                }
            }
            /*if (state === 'failed' || state === 'disconnected') {
                Janus.error('[attachToTextRoomPlugin] ICE ' + state);
                const errorMessage = 'ICE failed (interactive connectivity establishment)';
                dispatch(addJanusError(errorMessage));
                sendToTextRoomService({ type: 'ERROR', payload: errorMessage });  // => onTextRoomPluginJoinFailed
                janusMachineService.send({ type: 'TEXTROOM_ERROR', payload: errorMessage }); // => disconnectFromJanusServer
                //janusMachineService.send({ type: 'NEW_CONNECT' });
            }*/
        },
        mediaState: (medium, on) => {
            Janus.log("[attachToTextRoomPlugin] mediaState " + (on ? "started" : "stopped") + " receiving our " + medium);
        },
        webrtcState: (on) => {
            Janus.log("[attachToTextRoomPlugin] webrtcState " + (on ? "up" : "down") + " now");
        },
        onmessage: (msg, jsep) => {
            Janus.debug("[attachToTextRoomPlugin] onmessage", msg);
            if (msg["error"]) {
                alert(msg["error"]);
            }
            if (jsep) {
                // Answer
                textRoom.createAnswer(
                    {
                        jsep,
                        media: { audio: false, video: false, data: true },	// We only use datachannels
                        success: (jsep) => {
                            Janus.debug("[attachToTextRoomPlugin] Got SDP!", jsep);
                            textRoom.send({ message: { request: 'ack' }, jsep });
                        },
                        error: (error) => {
                            Janus.error("[attachToTextRoomPlugin] WebRTC error:", error);
                        }
                    });
            }
        },
        ondataopen: (data) => {
            Janus.log("[attachToTextRoomPlugin] ondataopen");
            //joinTextRoom();
            sendToTextRoomService({ type: 'DATA_OPENED' });
        },
        ondata: (data) => {
            Janus.debug("[attachToTextRoomPlugin] ondata", data);
            const json = JSON.parse(data);
            const transaction = json['transaction'];
            if (transactions[transaction]) {
                transactions[transaction](json);
                delete transactions[transaction];
                return;
            }
            const what = json['textroom'];
            switch (what) {
                case 'message': {
                    // redux devtool actions are lost, or overwritten, limit messages to see them
                    /*window.c1 = window.c1 || 0;
                    window.c1++;
                    if (window.c1 > 32) break;*/
                    const message = {type: MESSAGE_TYPE_GENERAL, text: json.text, from: json.from, date: json.date};
                    const state = getState();
                    const participant = selectParticipantByFrom(state, json.from);
                    if (participant) message.display = participant.display;
                    const user = selectUserByFrom(state, json.from);
                    if (user) {
                        message.fromUser = user;
                    } else {
                        dispatch(askExternalUser(json.from));
                    }
                    if (json.whisper) {
                        message.whisper = true;
                    }
                    dispatch(addMessage(message));
                    break;
                }
                case 'announcement':
                    break;
                case 'join': {
                    const settings = selectSettings(getState());
                    if (!settings.showJoinLeave) return;
                    const participant = { username: json.username, display: json.display };
                    dispatch(addParticipant(participant));
                    dispatch(addMessage({
                        type: MESSAGE_TYPE_SYSTEM,
                        text: json.display + ' joined',
                        date: new Date().toISOString()
                    }));
                    dispatch(askExternalUser(json.username)).then(() => {
                        const user = selectUserByFrom(getState(), json.username);
                        if (user) {
                            dispatch(setUserOnline(user));
                        }
                    });
                    break;
                }
                case 'leave': {
                    const settings = selectSettings(getState());
                    if (!settings.showJoinLeave) return;
                    const participant = selectParticipantByFrom(getState(), json.username);
                    if (participant) {
                        dispatch(addMessage({
                            type: MESSAGE_TYPE_SYSTEM,
                            text: participant.display + ' left',
                            date: new Date().toISOString()
                        }))
                    }
                    const p2 = { username: json.username };
                    dispatch(removeParticipant(p2));
                    const user = selectUserByFrom(getState(), json.username);
                    if (user) {
                        dispatch(setUserOffline(user));
                    }
                    break;
                }
                case 'kicked':
                    break;
                case 'destroyed':
                    sendToTextRoomService({ type: 'DESTROYED', payload: `Room #${json.room} destroyed.` });
                    break;
            }
        },
        oncleanup: function() {
            Janus.log("[attachToTextRoomPlugin] oncleanup");
        },
        ondetached: function() {
            Janus.log("[attachToTextRoomPlugin] ondetached");
        }
    });
}


function setupTextRoomPlugin() {
    console.log('setupTextRoomPlugin');
    textRoom.send({ message: { request: 'setup' } });
}

export function joinTextRoom() {
    console.log('joinTextRoom');
    const transaction = randomString(12);
    const {
        janus: { textRoomPinRequired, textRoomPinValue, restoringConnect },
        textRoom: { roomId }, user
    } = getState();
    const command = {
        textroom: 'join',
        transaction,
        room: roomId,
        username: user.username,
        display: user.displayName,
        // when restoringConnect the interface and messages already displayed, do not ask for history messages
        history: restoringConnect ? false : true,
    };

    if (textRoomPinRequired) {
        command.pin = textRoomPinValue;
        dispatch(setTextRoomJoiningWithPin(true));
    }

    console.log('[joinTextRoom] command', command)

    // callback
    transactions[transaction] = response => {
        dispatch(setTextRoomJoiningWithPin(false)); // join try ended, good-bad no matter
        if (response['textroom'] === 'error') {
            const errorMessage = response.error;
            Janus.error('[joinTextRoom] response', response);
            dispatch(addJanusError(errorMessage));
            switch (response['error_code']) {
                case 413: // missing element
                    if (errorMessage.includes('(pin)')) {
                        // pin required
                        dispatch(setTextRoomPinRequired(true));
                    }
                    break;
                case 414: // invalid element
                    break;
                case 415: // invalid request
                    break;
                case 416: // already setup
                    break;
                case 417: // unknown room
                    sendToTextRoomService({ type: 'ERROR', error: errorMessage });
                    break;
                case 418: // room already exists
                    break;
                case 419: // unauthorized (pin incorrect or check_tokens set)
                    dispatch(setTextRoomPinIncorrect(true));
                    break;
                case 420: // username already taken
                    // in firefox we get here when ice failed and do new connect
                    //if (restoringConnect) {
                        sendToTextRoomService({ type: 'ERROR', error: errorMessage });
                    //} // why only in restoring? should be always
                    break;
                case 421: // already in room
                    break;
                case 422: // not in room
                    break;
                case 423: // no such user
                    break;
            }
            return;
        }

        sendToTextRoomService({ type: 'JOINED' });

        if (response.participants && response.participants.length > 0) {
            dispatch(addParticipants(response.participants));
            response.participants.forEach(p => {
                dispatch(askExternalUser(p.username)).then(() => {
                    const user = selectUserByFrom(getState(), p.username);
                    if (user) {
                        dispatch(setUserOnline(user));
                    }
                });
            })
        }
    }

    textRoom.data({
        text: JSON.stringify(command),
        error: reason => {
            Janus.error('[joinTextRoom][data] error', reason);
        }
    });
}


export function sendMessage(text, tos) {
    console.log('sendMessage', text, tos);
    const message = {
        textroom: 'message',
        transaction: randomString(12),
        room: getState().textRoom.roomId,
        text: text,
    };
    if (tos && tos.length > 0) {
        message.tos = tos;
        // option 1: good
        //message.to = to;
        // add my own messages to list

        // option 2: fast
        // send to other user and to me as a whisper message (private)
        const me = getState().user.username;
        message.tos = Array.from(new Set([me, ...tos]));
    }
    textRoom.data({
        text: JSON.stringify(message),
        /*success: () => {
            Janus.log('sendMessage', 'success');
        },*/
        error: reason => {
            Janus.error('sendMessage', reason);
        },
    });
}
