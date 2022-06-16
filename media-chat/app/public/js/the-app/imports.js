// preact 10.8.0 put into local dir, unpkg.com have not-correct builds


const shouldLoadDT = true; //new URLSearchParams(window.location.search).has('dev');
console.log('should load devtool?', shouldLoadDT);
if (shouldLoadDT) {
    //await import('https://unpkg.com/preact@10.8.0/devtools/dist/devtools.module.js?module');
    await import('/js/vendor/preact/devtools.module.js');
}

//import { h, render, createContext, createElement } from 'https://unpkg.com/preact@10.8.0?module';
import { h, render, createContext, createElement, createRef } from '/js/vendor/preact/preact.module.js';

//import { useContext, useState, useReducer, useMemo } from 'https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module';
import {
    useContext, useState, useReducer,
    useMemo, useCallback, useRef, useDebugValue,
    useEffect, useLayoutEffect
} from '/js/vendor/preact/hooks.module.js';

// has wrong path to hooks
//import { memo, forwardRef, unstable_batchedUpdates } from 'https://unpkg.com/preact@10.8.0/compat/dist/compat.module.js?module';
import { memo, forwardRef, unstable_batchedUpdates } from '/js/vendor/preact/compat.module.js';

import htm from 'https://unpkg.com/htm@latest/dist/htm.module.js?module';
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
await import('https://unpkg.com/react-redux@7.2.8/dist/react-redux.js');
//import('../react-redux-temp.js');
console.log('window.ReactRedux', window.ReactRedux);
delete window.React;
delete window.ReactDOM;
const { Provider, useSelector, useDispatch } = window.ReactRedux;

// redux toolkit
import 'https://unpkg.com/@reduxjs/toolkit@1.8.2/dist/redux-toolkit.umd.js';
console.log('window.RTK', window.RTK);
const { configureStore, createSlice, createAction, createAsyncThunk } = window.RTK;

// day.js
import dayjs from 'https://unpkg.com/dayjs@1.11.3/esm/index.js';
import isToday from 'https://unpkg.com/dayjs@1.11.3/esm/plugin/isToday/index.js';
dayjs.extend(isToday);


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
    dayjs
}
