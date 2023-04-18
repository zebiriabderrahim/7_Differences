import { SCORE_POSITION } from '@common/constants';
import { GameModes, MessageTag } from '@common/enums';
import { ChatMessage, NewRecord } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageManagerService {
    private time: Date;

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
                ` – ${newRecord.playerName} est maintenant ${SCORE_POSITION[newRecord.rank]}` +
                ` dans les meilleurs temps du jeu ${newRecord.gameName} en ${newRecord.gameMode}`,
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
        const localMessage: ChatMessage = this.basicMessage('Différence trouvée');
        return this.appendPlayerName(localMessage, playerName);
    }

    private getErrorMessage(playerName?: string): ChatMessage {
        const localMessage: ChatMessage = this.basicMessage('Erreur');
        return this.appendPlayerName(localMessage, playerName);
    }

    private basicMessage(message: string): ChatMessage {
        return {
            tag: MessageTag.Common,
            message: this.getFormatTime() + ' - ' + message,
        };
    }
}
