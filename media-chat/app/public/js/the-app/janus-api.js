import { server, iceServers, opaqueId } from './config.js';
import { simplePromise, randomString } from './utils.js';
import {
    tryConnect,
    connected,
    tryTextRoomJoin,
    textRoomJoined,
    addJanusError,
    tryReconnect,
    reconnectLimitReached,
} from './redux-toolkit/slices/janus-slice.js';
import {
    setParticipants,
    addParticipants,
    addParticipant,
    removeParticipant,
    addMessage,
    selectParticipantByFrom,
} from './redux-toolkit/slices/text-room-slice.js';
import { MESSAGE_TYPE_GENERAL, MESSAGE_TYPE_SYSTEM } from './constants.js';
import { askExternalUser } from './redux-toolkit/actions/users-actions.js';
import { selectUserByFrom } from './redux-toolkit/slices/users-slice.js';

let janus = null;
let textRoom = null;
const transactions = []; // callbacks for some transactions
let reconnectTry = 0;
const reconnectLimit = 10;
const reconnectPause = 5000;
let reconnectInterval = null;


let store = null;
let dispatch = null;


export function startJanus(theStore) {
    store = theStore;
    dispatch = theStore.dispatch;
    connectToJanus();
}

function connectToJanus() {
    dispatch(tryConnect());

    const initOptions = {
        debug: 'all',
        callback: initDone,
    };

    function initDone() {
        console.log('initDone');
        janus = new Janus(gatewayCallbacks);
    }

    const gatewayCallbacks = {
        server,
        iceServers,
        success: gwcSuccess,
        error: gwcError,
        destroyed: gwcDestroyed,
    };

    function gwcSuccess() {
        console.log('gwcSuccess');
        dispatch(connected());
        attachToTextRoom();
    }

    function gwcError(error) {
        Janus.error('gwcError', error);
        dispatch(addJanusError(error));
        if (error === 'Lost connection to the server (is it down?)') {
            tryToReconnectJanus();
        }
    }

    function gwcDestroyed() {
        console.warn('gwcDestroyed');
    }

    Janus.init(initOptions);
}

export function sendMessage(text) {
    const message = {
        textroom: 'message',
        transaction: randomString(12),
        room: store.getState().textRoom.roomId,
        text: text,
    };
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


function attachToTextRoom() {
    // attach to TextRoom plugin
    janus.attach({
        plugin: 'janus.plugin.textroom',
        opaqueId,
        success: (pluginHandle) => {
            textRoom = pluginHandle;
            textRoom.send({ message: { request: 'setup' } });
        },
        error: (error) => {
            console.error("  -- Error attaching plugin...", error);
            dispatch(addJanusError(error));
        },
        iceState: (state) => {
            Janus.log("ICE state changed to " + state);
        },
        mediaState: (medium, on) => {
            Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
        },
        webrtcState: (on) => {
            Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
        },
        onmessage: (msg, jsep) => {
            Janus.debug(" ::: Got a message :::", msg);
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
                            Janus.debug("Got SDP!", jsep);
                            textRoom.send({ message: { request: 'ack' }, jsep });
                        },
                        error: (error) => {
                            Janus.error("WebRTC error:", error);
                        }
                    });
            }
        },
        ondataopen: (data) => {
            Janus.log("The DataChannel is available!");
            //dispatch(textRoomConnected(true));
            joinTextRoom();
        },
        ondata: (data) => {
            Janus.debug("We got data from the DataChannel!", data);
            const json = JSON.parse(data);
            const transaction = json['transaction'];
            if (transactions[transaction]) {
                transactions[transaction](json);
                delete transactions[transaction];
                return;
            }
            const what = json['textroom'];
            switch (what) {
                case 'message':
                    const message = { type: MESSAGE_TYPE_GENERAL, text: json.text, from: json.from, date: json.date };
                    const state = store.getState();
                    const participant = selectParticipantByFrom(state, json.from);
                    if (participant) message.display = participant.display;
                    const user = selectUserByFrom(state, json.from);
                    if (user) {
                        message.user = user;
                    } else {
                        dispatch(askExternalUser(json.from));
                    }
                    dispatch(addMessage(message));
                    break;
                case 'announcement':
                    break;
                case 'join':
                    const p1 = { username: json.username, display: json.display };
                    dispatch(addParticipant(p1));
                    dispatch(addMessage({ type: MESSAGE_TYPE_SYSTEM, text: json.display + ' joined', date: new Date().toISOString() }));
                    dispatch(askExternalUser(json.username));
                    break;
                case 'leave':
                    const found = selectParticipantByFrom(store.getState(), json.username);
                    if (found) {
                        dispatch(addMessage({ type: MESSAGE_TYPE_SYSTEM, text: found.display + ' left', date: new Date().toISOString() }))
                    }
                    const p2 = { username: json.username };
                    dispatch(removeParticipant(p2));
                    break;
                case 'kicked':
                    break;
                case 'destroyed':
                    break;
            }
        },
        oncleanup: function() {
            Janus.log(" ::: Got a cleanup notification :::");
        }
    });
}

function joinTextRoom() {
    dispatch(tryTextRoomJoin());

    const transaction = randomString(12);
    const { textRoom: { roomId }, user } = store.getState();
    const command = {
        textroom: 'join',
        transaction,
        room: roomId,
        username: user.username,
        display: user.displayName,
        history: true, // doesn't work in old 0.10.7
    };

    // callback
    transactions[transaction] = response => {
        if (response['textroom'] === 'error') {
            switch (response['error_code']) {
                case 417: // unknown room
                    break;
                case 420: // username already taken
                    break;
            }
            Janus.error(response)
            dispatch(addJanusError(response.error));
            return;
        }
        dispatch(textRoomJoined(true));
        reconnectTry = 0;
        if (response.participants && response.participants.length > 0) {
            dispatch(addParticipants(response.participants));
        }
    }

    textRoom.data({
        text: JSON.stringify(command),
        error: reason => {
            Janus.error('joinTextRoom', reason);
        }
    });

}


function tryToReconnectJanus() {
    console.log('tryToReconnectJanus')
    if (reconnectTry >= reconnectLimit) {
        console.log('janus reconnectLimit reached');
        stopReconnect();
        return;
    }

    let tryFinished = true;

    function reconnect() {
        console.log('tryToReconnectJanus reconnect p1')
        if (!tryFinished) return; // wait more time
        console.log('tryToReconnectJanus reconnect p2', 'try', reconnectTry+1);

        if (reconnectTry >= reconnectLimit) {
            console.log('janus reconnectLimit reached 2');
            stopReconnect();
            return;
        }
        reconnectTry++;

        tryFinished = false;
        dispatch(tryReconnect());
        janus.reconnect({
            success: () => {
                Janus.log('tryToReconnectJanus reconnectSuccess');
                clearInterval(reconnectInterval);
                reconnectInterval = null;
                dispatch(connected());
                dispatch(textRoomJoined(true));
                reconnectTry = 0;
                tryFinished = true;
            },
            error: (error) => {
                Janus.log('tryToReconnectJanus reconnectError', error);

                if (String(error).substring(0, 15) === 'No such session') {
                    clearInterval(reconnectInterval);
                    reconnectInterval = null;
                    Janus.warn('do full reconnect');
                    janus.destroy({
                        cleanupHandles: true,
                        success: () => {
                            Janus.log('tryToReconnectJanus reconnectError destroy success');
                            connectToJanus();
                        },
                        error: (reason) => {
                            Janus.log('tryToReconnectJanus reconnectError destroy error', reason);
                        },
                    });

                } else {
                    tryFinished = true;
                }

            },
        });
    }

    reconnect();
    reconnectInterval = setInterval(reconnect, reconnectPause);
}


function stopReconnect() {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
    dispatch(reconnectLimitReached());
    dispatch(addJanusError('Reached limit of reconnects:' + reconnectLimit));
}
