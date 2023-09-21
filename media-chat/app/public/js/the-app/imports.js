// preact 10.11.3 put into local dir, unpkg.com have not-correct builds


const devMode = true; //new URLSearchParams(window.location.search).has('dev');
console.log('devMode', devMode);
if (devMode) {
    //await import('https://unpkg.com/preact@10.11.3/devtools/dist/devtools.module.js?module');
    await import('/js/vendor/preact/preact.devtools.js');
}

//import { h, render, createContext, createElement } from 'https://unpkg.com/preact@10.11.3?module';
import { h, render, createContext, createElement, createRef } from '/js/vendor/preact/preact.js';

//import { useContext, useState, useReducer, useMemo } from 'https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module';
import {
    useContext, useState, useReducer,
    useMemo, useCallback, useRef, useDebugValue,
    useEffect, useLayoutEffect
} from '/js/vendor/preact/preact.hooks.js';

// has wrong path to hooks
//import { memo, forwardRef, unstable_batchedUpdates } from 'https://unpkg.com/preact@10.11.1/compat/dist/compat.module.js?module';
import { memo, forwardRef, unstable_batchedUpdates } from '/js/vendor/preact/preact.compat.js';

import htm from '/js/vendor/htm/htm.js';
const html = htm.bind(h);

//console.log('useMemo', useMemo);
//console.log('useLayoutEffect', useLayoutEffect);

// react-redux
// crutch, make supportable with preact
window.React = {
    default: {
        createContext,
        createElement,
        memo,
        forwardRef,
    },
    useContext,
    useReducer,
    useMemo,
    useRef,
    useDebugValue,
    useEffect,
    useLayoutEffect,
}
window.ReactDOM = {
    unstable_batchedUpdates,
}
await import('https://unpkg.com/react-redux@7.2.9/dist/react-redux.js');
//import('../react-redux-temp.js');
devMode && console.log('window.ReactRedux', window.ReactRedux);
delete window.React;
delete window.ReactDOM;
const { Provider, useSelector, useDispatch } = window.ReactRedux;

// redux toolkit
import 'https://unpkg.com/@reduxjs/toolkit@1.9.5/dist/redux-toolkit.umd.js';
devMode && console.log('window.RTK', window.RTK);
const { configureStore, createSlice, createAction, createAsyncThunk } = window.RTK;

// day.js
import dayjs from 'https://unpkg.com/dayjs@1.11.5/esm/index.js';
import isToday from 'https://unpkg.com/dayjs@1.11.5/esm/plugin/isToday/index.js';
dayjs.extend(isToday);

// state-machine
//import  '/js/vendor/javascript-state-machine/state-machine.js';
//import 'https://unpkg.com/javascript-state-machine@3.1.0/lib/state-machine.js';
//import StateMachine from 'https://cdn.skypack.dev/javascript-state-machine';
//import StateMachine from '/js/vendor/javascript-state-machine/state-machine.esm.js';

import 'https://unpkg.com/xstate@4.38.2/dist/xstate.js'
const xstate = window.XState;
//console.log('window.XState', window.XState);

export {
    // htm
    html,
    // preact
    render,
    createContext,
    createRef,
    useContext,
    useState,
    useReducer,
    useMemo,
    useCallback,
    useRef,
    useEffect,
    useLayoutEffect,
    // react-redux
    Provider,
    useSelector,
    useDispatch,
    // redux-toolkit
    configureStore,
    createSlice,
    createAction,
    createAsyncThunk,
    // day.js
    dayjs,
    // state machine
    xstate,
}
