


export async function appWork() {
    console.log('appWork');
    console.log('isWebrtcSupported', Janus.isWebrtcSupported());

    const appReady = simplePromise();

    let janus = null;
    let textRoom = null;
    const server = 'wss://' + window.location.hostname + ':8989';
    const iceServers = [
        {
            urls: "stun:openrelay.metered.ca:80"
        },
        {
            urls: "turn:openrelay.metered.ca:80?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
        }
    ];
    const opaqueId = 'app-' + Janus.randomString(12);

    function initDone() {
        console.log('initDone');
        janus = new Janus(gatewayCallbacks);
    }

    function gwcSuccess() {
        console.log('gwcSuccess');

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
            },
            ondata: (data) => {
                Janus.debug("We got data from the DataChannel!", data);
            },
        });

        appReady.resolve();
    }

    function gwcError(error) {
        console.log('gwcError', error);
        Janus.error(error);
        appReady.reject(error);
    }

    function gwcDestroy() {
        console.log('gwcDestroy');
    }

    const gatewayCallbacks = {
        server,
        iceServers,
        success: gwcSuccess,
        error: gwcError,
        destroy: gwcDestroy,
    };

    const initOptions = {
        debug: 'all',
        callback: initDone,
    };

    Janus.init(initOptions);

    return appReady.promise;
}



function simplePromise() {
    let resolve, reject;
    const promise = new Promise((origResolve, origReject) => {
        resolve = origResolve;
        reject = origReject;
    });
    return { promise, resolve, reject };
}
