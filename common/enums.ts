export enum GameEvents {
    ValidateCoords = 'validateCoords',
    CheckStatus = 'checkStatus',
    EndGame = 'endGame',
    TimerStarted = 'timerStarted',
    RemoveDiff = 'removeDiff',
    GameStarted = 'OneVsOneStarted',
    AbandonGame = 'AbandonGame',
    WaitingPlayerNameListUpdated = 'WaitingPlayerNameListUpdated',
    StartGameByRoomId = 'CreateOneVsOneGame',
    StartNextGame = 'StartNextGame',
}

export enum PlayerEvents {
    PlayerRefused = 'PlayerRefused',
    GetJoinedPlayerNames = 'GetJoinedPlayerNames',
    PlayerAccepted = 'PlayerAccepted',
    AcceptPlayer = 'AcceptPlayer',
    CancelJoining = 'CancelJoining',
    RefusePlayer = 'RefusePlayer',
    PlayerNameTaken = 'PlayerNameTaken',
    UpdateWaitingPlayerNameList = 'UpdateWaitingPlayerNameList',
    CheckIfPlayerNameIsAvailable = 'CheckIfPlayerNameIsAvailable',

}

export enum GameCardEvents {
    ResetTopTime = 'ResetTopTime',
    ResetAllTopTimes = 'ResetAllTopTimes',
    GameCardDeleted = 'GameCardDeleted',
    GameCardCreated = 'GameCardCreated',
    RequestReload = 'RequestGameCardsUpdate',
    AllGamesDeleted = 'AllGamesDeleted',
    GameDeleted = 'GameDeleted',
    GameConstantsUpdated = 'GameConstantsUpdated',
    GetGameCards = 'GetGameCards',
}

export enum RoomEvents {
    CreateSoloGame = 'createSoloGame',
    RoomSoloCreated = 'RoomSoloCreated',
    RoomLimitedCreated = 'RoomLimitedCreated',
    CreateSoloLimitedRoom = 'CreateSoloLimitedRoom',
    RoomOneVsOneCreated = 'roomOneVsOneCreated',
    RoomOneVsOneAvailable = 'RoomOneVsOneAvailable',
    CreateOneVsOneRoom = 'CreateOneVsOneRoom',
    CreateOneVsOneLimitedRoom = 'CreateOneVsOneLimitedRoom',
    CheckRoomOneVsOneAvailability = 'CheckRoomOneVsOneAvailability',
    UpdateRoomOneVsOneAvailability = 'UpdateRoomOneVsOneAvailability',
    OneVsOneRoomDeleted = 'OneVsOneRoomDeleted',
    UndoCreation = 'UndoCreation',
    DeleteCreatedOneVsOneRoom = 'DeleteCreatedOneVsOneRoom',
    JoinOneVsOneRoom = 'JoinOneVsOneRoom',
}

export enum GameModes {
    ClassicSolo = 'Classic->Solo',
    ClassicOneVsOne = 'Classic->OneVsOne',
    LimitedSolo = 'Limited->Solo',
    LimitedCoop = 'Limited->Coop',
}

export enum MessageEvents {
    LocalMessage = 'LocalMessage',
    GlobalMessage = 'GlobalMessage',
}

export enum MessageTag {
    sent = 'sent',
    received = 'received',
    common = 'common',
    global = 'global',
}
