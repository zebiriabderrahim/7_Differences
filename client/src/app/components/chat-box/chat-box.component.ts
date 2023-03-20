import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatMessage, GameModes } from '@common/game-interfaces';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent {
    @Input() messages: ChatMessage[];
    @Input() gameMode: string;
    @Output() add = new EventEmitter<string>();
    oneVsOneGameMode: string;

    constructor() {
        this.messages = [];
        this.oneVsOneGameMode = GameModes.ClassicOneVsOne;
    }

    onAdd(inputField: { value: string }): void {
        if (inputField.value !== '') {
            this.add.emit(inputField.value?.trim());
            inputField.value = '';
        }
    }
}
