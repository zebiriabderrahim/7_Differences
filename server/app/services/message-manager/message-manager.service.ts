import { ChatMessage, GameModes, MessageTag } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageManagerService {
    private time: Date;

    getFormatTime(): string {
        this.time = new Date();
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
            message: this.getFormatTime() + ' - Erreur',
        };
        return localMessage;
    }

    getOneVsOneErrorMessage(playerName: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + `- Erreur par ${playerName}`,
        };
        return localMessage;
    }

    getQuitMessage(playerName: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + `- ${playerName} a abandonné la partie`,
        };
        return localMessage;
    }

    getLocalMessage(gameMode: string, isFound: boolean, playerName: string): ChatMessage {
        if (isFound) {
            return gameMode === GameModes.ClassicSolo ? this.getSoloDifferenceMessage() : this.getOneVsOneDifferenceMessage(playerName);
        } else {
            return gameMode === GameModes.ClassicSolo ? this.getSoloErrorMessage() : this.getOneVsOneErrorMessage(playerName);
        }
    }
}
