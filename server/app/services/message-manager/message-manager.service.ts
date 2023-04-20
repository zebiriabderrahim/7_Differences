import { SCORE_POSITION } from '@common/constants';
import { GameModes, MessageTag } from '@common/enums';
import { ChatMessage, NewRecord } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageManagerService {
    getQuitMessage(playerName: string): ChatMessage {
        return this.createMessage(MessageTag.Common, `${playerName} a abandonné la partie`);
    }

    getNewRecordMessage(newRecord: NewRecord): ChatMessage {
        const content =
            `${newRecord.playerName} obtient la ${SCORE_POSITION[newRecord.rank]} place` +
            ` dans les meilleurs temps du jeu ${newRecord.gameName} en ${newRecord.gameMode}`;
        return this.createMessage(MessageTag.Global, content);
    }

    getLocalMessage(gameMode: string, isDifferenceFound: boolean, playerName: string): ChatMessage {
        let content = isDifferenceFound ? 'Différence trouvée' : 'Erreur';
        if (gameMode !== GameModes.ClassicSolo && gameMode !== GameModes.LimitedSolo) {
            content += ` par ${playerName}`;
        }
        return this.createMessage(MessageTag.Common, content);
    }

    private createMessage(tag: MessageTag, content: string): ChatMessage {
        const date: Date = new Date();
        const time = `${date.getHours()} : ${date.getMinutes()} : ${date.getSeconds()}`;
        const message = time + ' - ' + content;
        return { tag, message };
    }
}
