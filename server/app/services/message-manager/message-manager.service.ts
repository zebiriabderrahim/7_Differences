import { ChatMessage, NewRecord } from '@common/game-interfaces';
import { GameModes, MessageTag } from '@common/enums';
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
            tag: MessageTag.Common,
            message: this.getFormatTime() + ' - Différence trouvée',
        };
        return localMessage;
    }

    getOneVsOneDifferenceMessage(playerName: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.Common,
            message: this.getFormatTime() + ` - Différence trouvée par ${playerName}`,
        };
        return localMessage;
    }

    getSoloErrorMessage(): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.Common,
            message: this.getFormatTime() + ' - Erreur',
        };
        return localMessage;
    }

    getOneVsOneErrorMessage(playerName: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.Common,
            message: this.getFormatTime() + ` - Erreur par ${playerName}`,
        };
        return localMessage;
    }

    getQuitMessage(playerName: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.Common,
            message: this.getFormatTime() + ` - ${playerName} a abandonné la partie`,
        };
        return localMessage;
    }

    getNewRecordMessage(newRecord: NewRecord): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.Global,
            message:
                this.getFormatTime() +
                `– ${newRecord.playerName} obtient la ${newRecord.rank} e` +
                `place dans les meilleurs temps du jeu ${newRecord.gameName} \n en ${newRecord.gameMode}`,
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
