import { xstate } from '../../imports.js';
const { createMachine, assign } = xstate;


export default createMachine({
    id: 'videoRoom',
    predictableActionArguments: true,
    initial: 'choose',
    context: {

    },
    states: {
        choose: {

        },
        joining: {

        },
        joined: {

        }
    }
})
