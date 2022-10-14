import iceServers from './config-ice-servers.js';

const server = 'wss://' + window.location.hostname + ':8989';
//const server = 'wss://absent-' + window.location.hostname + ':1111';
const opaqueId = 'app-' + Janus.randomString(12);

export {
    server,
    iceServers,
    opaqueId,
}
