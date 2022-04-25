import { Controller } from '@hotwired/stimulus';


export default class extends Controller {
    static targets = ['name', 'output']

    greet() {
        let hi = 'Enter name to greet!';
        if (this.nameTarget.value) {
            hi = `Hello, ${this.nameTarget.value}!`
        }
        this.outputTarget.textContent = hi;
    }

    async getRooms() {
        const response = await fetch('https://jc-api-a91.cc.lan/textroom/');
        const data = await response.json();
        console.log('rooms', data.rooms)
    }
}
