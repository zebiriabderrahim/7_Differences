import { Component, Input } from '@angular/core';
import { MessageTag } from '@common/game-interfaces';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent {
    @Input() opponentName: string = '';
    messages: { tag: string; message: string }[] = [];
    alert(): void {
        window.alert('Your message was sent');
    }
    addNewMessage(inputField: { value: string }) {
        const val = inputField.value?.trim();
        if (val.length) {
            this.messages.push({ tag: MessageTag.sent, message: val });
        }
        inputField.value = '';
    }
}
