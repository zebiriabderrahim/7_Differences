import { Component } from '@angular/core';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent {
    messages: string[] = ['message1', 'message2', 'message3', 'message4'];
    alert(): void {
        window.alert('Your message was sent');
    }
    addNewMessage(inputField: { value: string }) {
        const val = inputField.value?.trim();
        if (val.length) {
            this.messages.push(val);
        }
        inputField.value = '';
    }
}
