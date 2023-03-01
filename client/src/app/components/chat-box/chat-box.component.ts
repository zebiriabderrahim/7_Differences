import { Component } from '@angular/core';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent {
    messages: { tag: string; message: string }[] = [];
    alert(): void {
        window.alert('Your message was sent');
    }
    addNewMessage(inputField: { value: string }) {
        const val = inputField.value?.trim();
        if (val.length) {
            this.messages.push({ tag: 'sent', message: val });
        }
        inputField.value = '';
    }

    fakeReceived(inputField: { value: string }) {
        const val = inputField.value?.trim();
        if (val.length) {
            this.messages.push({ tag: 'received', message: val });
        }
        inputField.value = '';
    }
}
