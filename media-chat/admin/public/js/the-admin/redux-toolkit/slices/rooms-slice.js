import { createSlice, createSelector, createDraftSafeSelector } from '../../imports.js';
//import { askExternalUser } from '../actions/users-actions.js';
import {
    getRooms, getRoom,
    createRoom, updateRoom, deleteRoom,
    startRoom, stopRoom,
    getRoomsStats
} from '../actions/rooms-actions.js';
import { userLogout } from '../actions/auth-actions.js';

// all text room, full objects from outside world
const initialFilter = {description: ''};
const initialState = {
    rooms: [],
    loading: false, // loading all
    loadingError: null,
    getting: false, // loading one
    gettingError: null,  // { status, title, detail }
    creating: false,
    creatingError: null,
    updating: false,
    updatingError: null,
    deleting: false,
    notInitialized: false,
    filter: {...initialFilter},
    filteredRooms: [],
    stats: {
        loading: false,
        totalRooms: 0,
        enabledRooms: 0,
        activeRooms: 0,
        deletedRooms: 0,
    },
}

export const roomsSlice = createSlice({
    name: 'rooms',
    initialState: { ...initialState, notInitialized: true },
    reducers: {
        cleanTextRoom: (state) => {
            return { ...initialState };
        },
        cleanCreatingError: (state) => {
            state.creatingError = null;
        },
        cleanUpdatingError: (state) => {
            state.updatingError = null;
        },
        setFilter: (state, action) => {
            state.filter = action.payload;
            state.filteredRooms = filterRooms(state.rooms, state.filter);
        },
        cleanFilter: (state, action) => {
            state.filter = {...initialFilter};
            state.filteredRooms = filterRooms(state.rooms, state.filter);
        },
    },
    extraReducers: {
        [userLogout.fulfilled]: (state, action) => {
            // reset slice on user leave
            return { ...initialState, notInitialized: true };
        },
        [getRooms.pending]: (state, action) => {
            //console.log('textRoomSlice textRoomGetAll.pending')
            state.loadingError = null;
            state.loading = true;
        },
        [getRooms.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.fulfilled')
            //return { ...state, loading: false, loadingError: null, rooms: action.payload.rooms, notInitialized: false }
            state.loading = false;
            state.loadingError = null;
            state.rooms = action.payload.rooms;
            state.filteredRooms = filterRooms(state.rooms, state.filter);
            state.notInitialized = false;
        },
        [getRooms.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.rejected')
            state.loadingError = action.error;
            state.loading = false;
        },
        [getRoom.pending]: (state) => {
            state.gettingError = null;
            state.getting = true;
        },
        [getRoom.fulfilled]: (state, action) => {
            const room = action.payload.room;
            const roomIdx = state.rooms.findIndex(r => {
                if (r.id == room.id) return true;
            })
            if (roomIdx > -1) {
                // update
                state.rooms = state.rooms.map((el,idx) => idx === roomIdx ? room : el)
            } else {
                // add
                state.rooms.push(action.payload.room)
            }
            state.filteredRooms = filterRooms(state.rooms, state.filter);
            state.getting = false;
        },
        [getRoom.rejected]: (state, action) => {
            //console.log('textRoomSlice textRoomGet.rejected', action.error);
            if (action.payload === 'check_rwvError') {
                state.gettingError = action.meta.rwvError;
            }
            state.getting = false;
        },
        [createRoom.pending]: (state, action) => {
            state.creatingError = null;
            state.creating = true;
        },
        [createRoom.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomCreate.fulfilled')
            state.creating = false;
        },
        [createRoom.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomCreate.rejected')
            if (action.payload === 'check_rwvError') {
                state.creatingError = action.meta.rwvError;
            }
            state.creating = false;
        },
        [updateRoom.pending]: (state, action) => {
            state.updatingError = null;
            state.updating = true;
        },
        [updateRoom.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomUpdate.fulfilled')
            //const roomId = action.payload.room;
            state.updating = false;
        },
        [updateRoom.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomUpdate.rejected')
            if (action.payload === 'check_rwvError') {
                state.updatingError = action.meta.rwvError;
            }
            state.updating = false;
        },
        [deleteRoom.pending]: (state, action) => {
            state.deleting = true;
        },
        [deleteRoom.fulfilled]: (state, action) => {
            const roomId = parseInt(action.meta.arg.roomId);
            state.rooms = state.rooms.filter(r => r.id !== roomId);
            state.filteredRooms = filterRooms(state.rooms, state.filter);
            state.deleting = false;
        },
        [deleteRoom.rejected]: (state, action) => {
            state.deleting = false;
        },
        [startRoom.fulfilled]: (state, action) => {
            // janus sends event after room is created/destroyed
            // update here mainly for instant interface update
            const roomId = parseInt(action.meta.arg.roomId);
            state.rooms.some((r, idx) => {
                if (r.id === roomId) {
                    state.rooms[idx].active = 1;
                    return true;
                }
            });
            state.filteredRooms = filterRooms(state.rooms, state.filter);
        },
        [stopRoom.fulfilled]: (state, action) => {
            const roomId = parseInt(action.meta.arg.roomId);
            state.rooms.some((r, idx) => {
                if (r.id === roomId) {
                    state.rooms[idx].active = 0;
                    return true;
                }
            });
            state.filteredRooms = filterRooms(state.rooms, state.filter);
        },
        [getRoomsStats.pending]: (state, action) => {
            state.stats.loading = true;
        },
        [getRoomsStats.fulfilled]: (state, action) => {
            state.stats.loading = false;
            state.stats.activeRooms = action.payload.active_rooms;
            state.stats.enabledRooms = action.payload.enabled_rooms;
            state.stats.totalRooms = action.payload.total_rooms;
            state.stats.deletedRooms = action.payload.deleted_rooms;
        },
        [getRoomsStats.rejected]: (state, action) => {
            state.stats.loading = false;
        },
    }
});

// Action creators are generated for each case reducer function
export const { cleanCreatingError, cleanUpdatingError, setFilter, cleanFilter } = roomsSlice.actions;

export default roomsSlice.reducer;


// Export a reusable selectors

export const selectRooms = (state) => {
    return state.rooms.rooms;
}

export const selectTextRoom = (state) => state.rooms;

export const selectRoomsLoading = createSelector(selectTextRoom, rooms => {
    console.log('[selector] selectRoomsLoading', rooms.loading)
    return rooms.loading
});

export const selectRoomsStats = (state) => state.rooms.stats;


export const selectRoomById = createSelector(
    [
        state => state.rooms.rooms,
        (_, roomId) => roomId,
    ],
    (rooms, roomId) => {
        let found = null;
        rooms.some(r => {
            //console.log('roomId', roomId, 'r', r)
            if (r.id == roomId) {
                found = r;
                return true;
            }
        })
        return found;
    }
);


function filterRooms(rooms, filter) {
    const { description } = filter;
    if (description.length < 1) return rooms.slice();
    const ld = description.toLowerCase();

    return rooms.filter(r => {
        return r.description?.toLowerCase().includes(ld);
    })
}
