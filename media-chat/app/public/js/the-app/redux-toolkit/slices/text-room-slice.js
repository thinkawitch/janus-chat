import { createSlice, createAction } from '../../imports.js';
import { selectUserByFrom } from './users-slice.js';
import { askExternalUser } from '../actions/users-actions.js';
import { isUserFull } from '../../utils.js';

//export const addMessage = createAction('textRoom/addMessage');

const initialState = {
    roomId: null,
    participants: [],
    messages: [],
}

export const textRoomSlice = createSlice({
    name: 'textRoom',
    initialState,
    reducers: {
        setRoomId: (state, action) => {
            state.roomId = action.payload;
        },
        setParticipants: (state, action) => {
            state.participants = action.payload;
        },
        addParticipants: (state, action) => {
            //state.participants = state.participants.concat(action.payload);
            action.payload.forEach(part => {
                addOrUpdateParticipant(state, part)
            });
        },
        addParticipant: (state, action) => {
            //state.participants.push(action.payload);
            addOrUpdateParticipant(state, action.payload);
        },
        removeParticipant: (state, action) => {
            state.participants = state.participants.filter(p => p.username != action.payload.username);
        },
        addMessage: (state, action) => {
            state.messages = state.messages.concat(action.payload);
        },
    },
    extraReducers: {
        /*[addMessage]: (state, action) => {
            const message = action.payload;
            const user = selectUserByFrom(state, message.from);
            if (user) message.user = user;
            state.messages = state.messages.concat(message);
        }*/
        [askExternalUser.fulfilled]: (state, action) => {
            const user = action.payload;
            state.messages.forEach(m => {
                if (!isUserFull(m.user) && m.from === user.username) {
                    m.fromUser = user;
                }
            })
        },
    }
});

export const {
    setRoomId,
    setParticipants,
    addParticipants,
    addParticipant,
    removeParticipant,
    addMessage,
} = textRoomSlice.actions;

export default textRoomSlice.reducer;

// Export a reusable selectors

export const selectParticipantByFrom = (state, from) => {
    let participant = null;
    state.textRoom.participants.some(p => {
        if (p.username === from) {
            participant = p;
            return true;
        }
    });
    return participant;
}

export const selectTextRoom = (state) => state.textRoom;


function addOrUpdateParticipant(state, participant) {
    const updated = state.participants.some((oldParticipant, idx) => {
        if (oldParticipant.username === participant.username) {
            state[idx] = {...oldParticipant, ...participant};
            return true;
        }
    });
    if (!updated) {
        state.participants.push(participant);
    }
}
