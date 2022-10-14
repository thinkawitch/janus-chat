// preact 10.11.1 put into local dir, unpkg.com have not-correct builds


const shouldLoadDT = true; //new URLSearchParams(window.location.search).has('dev');
console.log('should load devtool?', shouldLoadDT);
if (shouldLoadDT) {
    //await import('https://unpkg.com/preact@10.11.1/devtools/dist/devtools.module.js?module');
    await import('/js/vendor/preact/devtools.module.js');

}

//import { h, render, createContext, createElement } from 'https://unpkg.com/preact@10.11.1?module';
import { h, render, createContext, createElement, createRef, Component } from '/js/vendor/preact/preact.module.js';

//import { useContext, useState, useReducer, useMemo } from 'https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module';
import {
    useContext, useState, useReducer,
    useMemo, useCallback, useRef, useDebugValue,
    useEffect, useLayoutEffect
} from '/js/vendor/preact/hooks.module.js';

// has wrong path to hooks
//import { memo, forwardRef, unstable_batchedUpdates } from 'https://unpkg.com/preact@10.11.1/compat/dist/compat.module.js?module';
import { memo, forwardRef, unstable_batchedUpdates } from '/js/vendor/preact/compat.module.js';

//import htm from 'https://unpkg.com/htm@latest/dist/htm.module.js?module';
import htm from 'https://unpkg.com/htm@3.1.1/dist/htm.module.js?module';
const html = htm.bind(h);

// preact-router
// https://unpkg.com/browse/preact-router@4.1.0/dist/
//import { Router, route } from 'https://unpkg.com/preact-router@4.1.0/dist/preact-router.module.js?module';
import { Router, route, useRouter } from '/js/vendor/preact-router/preact-router.js';



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
console.log('window.ReactRedux', window.ReactRedux);
delete window.React;
delete window.ReactDOM;
const { Provider, useSelector, useDispatch, shallowEqual } = window.ReactRedux;

// redux toolkit
import 'https://unpkg.com/@reduxjs/toolkit@1.8.6/dist/redux-toolkit.umd.js';
console.log('window.RTK', window.RTK);
const { configureStore, createSlice, createAction, createAsyncThunk, createSelector, createDraftSafeSelector } = window.RTK;

// redux toolkit query, can't connect with preact
// import 'https://unpkg.com/@reduxjs/toolkit@1.8.6/dist/query/rtk-query.umd.js';
// //import 'https://unpkg.com/@reduxjs/toolkit@1.8.6/dist/query/react/rtk-query-react.umd.js';
// console.log('window.RTKQ', window.RTKQ);
// const { createApi, fetchBaseQuery, setupListeners } = window.RTKQ;

// day.js
import dayjs from 'https://unpkg.com/dayjs@1.11.5/esm/index.js';
import isToday from 'https://unpkg.com/dayjs@1.11.5/esm/plugin/isToday/index.js';
dayjs.extend(isToday);


// https://gist.github.com/thinkawitch/25f622448c899f2908e4735638b7dfcf
function useAbortController(runEffect=false, runLayoutEffect=false) {
    const acRef = useRef()
    const getAbortController = useCallback(() => {
        if (!acRef.current) {
            acRef.current = new AbortController()
        }
        return acRef.current
    }, []);

    if (runEffect) {
        useEffect(() => {
            return () => {
                acRef.current && acRef.current.abort()
            }
        }, [])
    }
    if (runLayoutEffect) {
        useLayoutEffect(() => {
            return () => {
                acRef.current && acRef.current.abort()
            }
        }, [])
    }

    const resetAbortController = useCallback(() => {
        acRef.current = new AbortController()
    }, [])

    return [getAbortController, resetAbortController]
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value; //assign the value of ref to the argument
    },[value]); //this code will run when the value of 'value' changes
    return ref.current; //in the end, return the current ref value.
}

function useSmallTitle(title) {
    useEffect(() => {
        const node = document.getElementById('pageTitleIfSmall');
        if (node) node.innerText = title;
    }, [])
}

export {
    // htm
    html,
    // preact
    render,
    Component,
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
    // preact-router
    Router,
    route,
    useRouter,
    // react-redux
    Provider,
    useSelector,
    useDispatch,
    shallowEqual,
    // redux-toolkit
    configureStore,
    createSlice,
    createAction,
    createAsyncThunk,
    createSelector,
    createDraftSafeSelector,
    // redux-toolkit-query
    // createApi,
    // fetchBaseQuery,
    // setupListeners,
    // day.js
    dayjs,
    // custom
    useAbortController,
    usePrevious,
    useSmallTitle,
}
