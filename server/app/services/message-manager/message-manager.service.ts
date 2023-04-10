import { GameModes, MessageTag } from '@common/enums';
import { ChatMessage, NewRecord } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageManagerService {
    private time: Date;

    getQuitMessage(playerName: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + ` - ${playerName} a abandonné la partie`,
        };
        return localMessage;
    }

    getNewRecordMessage(newRecord: NewRecord): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.global,
            message:
                this.getFormatTime() +
                `– ${newRecord.playerName} obtient la ${newRecord.rank} e` +
                `place dans les meilleurs temps du jeu ${newRecord.gameName} \n en ${newRecord.gameMode}`,
        };
        return localMessage;
    }

    getLocalMessage(gameMode: string, isFound: boolean, playerName: string): ChatMessage {
        if (isFound) {
            return gameMode === GameModes.ClassicSolo ? this.getDifferenceMessage() : this.getDifferenceMessage(playerName);
        } else {
            return gameMode === GameModes.ClassicSolo ? this.getErrorMessage() : this.getErrorMessage(playerName);
        }
    }

    private getFormatTime(): string {
        this.time = new Date();
        return `${this.time.getHours()} : ${this.time.getMinutes()} : ${this.time.getSeconds()}`;
    }

    private appendPlayerName(localMessage: ChatMessage, playerName?: string): ChatMessage {
        if (playerName) {
            localMessage.message += ` par ${playerName}`;
        }
        return localMessage;
    }

    private getDifferenceMessage(playerName?: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + ' - Différence trouvée',
        };
        return this.appendPlayerName(localMessage, playerName);
    }

    private getErrorMessage(playerName?: string): ChatMessage {
        const localMessage: ChatMessage = {
            tag: MessageTag.common,
            message: this.getFormatTime() + ' - Erreur',
        };
        return this.appendPlayerName(localMessage, playerName);
    }
}
