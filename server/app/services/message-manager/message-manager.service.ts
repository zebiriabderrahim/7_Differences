import { ChatMessage, MessageTag } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageManagerService {
    private time: Date;
    constructor() {
        this.time = new Date();
    }

    getFormatTime(): string {
        return `${this.time.getHours()} : ${this.time.getMinutes()} : ${this.time.getSeconds()}`;
    }

    getSoloDifferenceMessage(): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + ' - Différences trouvé',
        };
        return localMessage;
    }

    getOneVsOneDifferenceMessage(playerName: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + `- Différences trouvé par ${playerName}`,
        };
        return localMessage;
    }

    getSoloErrorMessage(): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + ' - Différences trouvé',
        };
        return localMessage;
    }
}
