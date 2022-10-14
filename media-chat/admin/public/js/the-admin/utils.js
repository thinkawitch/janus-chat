import { dayjs } from './imports.js';

export function simplePromise() {
    let resolve, reject;
    const promise = new Promise((origResolve, origReject) => {
        resolve = origResolve;
        reject = origReject;
    });
    return { promise, resolve, reject };
}

export function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

export function getDateString(jsonDate) {
    var when = new Date();
    if(jsonDate) {
        when = new Date(Date.parse(jsonDate));
    }
    var dateString =
        ("0" + when.getUTCHours()).slice(-2) + ":" +
        ("0" + when.getUTCMinutes()).slice(-2) + ":" +
        ("0" + when.getUTCSeconds()).slice(-2);
    return dateString;
}


export function formatMessageDate(date) {
    const d = dayjs(date);
    let format = 'HH:mm'
    if (!d.isToday()) {
        format = 'MMM D, HH:mm';
    }
    return d.format(format);

    // old
    if (!(date instanceof Date)) {
        date = new Date(Date.parse(date));
    }
    return ("0" + date.getHours()).slice(-2) + ":" +
        ("0" + date.getMinutes()).slice(-2) + ":" +
        ("0" + date.getSeconds()).slice(-2);
}


export function isUserFull(user) {
    return user && user.id && user.username && user.displayName;
}
