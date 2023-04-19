export enum GameEvents {
    ValidateCoords = 'ValidateCoords',
    CheckStatus = 'CheckStatus',
    EndGame = 'EndGame',
    TimerUpdate = 'TimerUpdate',
    RemoveDifference = 'removeDifference',
    GameStarted = 'GameStarted',
    AbandonGame = 'AbandonGame',
    StartGameByRoomId = 'CreateOneVsOneGame',
    StartNextGame = 'StartNextGame',
    RequestHint = 'RequestHint',
    UpdateDifferencesFound = 'UpdateDifferencesFound',
    GameModeChanged = 'GameModeChanged',
    GamePageRefreshed = 'Refresh',
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
    WaitingPlayerNameListUpdated = 'WaitingPlayerNameListUpdated',
}


export enum GameCardEvents {
    ResetTopTime = 'ResetTopTime',
    ResetAllTopTimes = 'ResetAllTopTimes',
    GameCardDeleted = 'GameCardDeleted',
    GameCardCreated = 'GameCardCreated',
    RequestReload = 'RequestReload',
    AllGamesDeleted = 'AllGamesDeleted',
    GameDeleted = 'GameDeleted',
    GameConstantsUpdated = 'GameConstantsUpdated',
    GamesHistoryDeleted = "GamesHistoryDeleted"
}

export enum HistoryEvents {
    RequestReload = "RequestReload"
}

export enum RoomEvents {
    CreateClassicSoloRoom = 'CreateClassicSoloRoom',
    RoomSoloCreated = 'RoomSoloCreated',
    RoomLimitedCreated = 'RoomLimitedCreated',
    CreateLimitedRoom = 'CreateSoloLimitedRoom',
    RoomOneVsOneCreated = 'RoomOneVsOneCreated',
    RoomOneVsOneAvailable = 'RoomOneVsOneAvailable',
    CreateOneVsOneRoom = 'CreateOneVsOneRoom',
    CreateCoopLimitedRoom = 'CreateCoopLimitedRoom',
    CheckRoomOneVsOneAvailability = 'CheckRoomOneVsOneAvailability',
    UpdateRoomOneVsOneAvailability = 'UpdateRoomOneVsOneAvailability',
    OneVsOneRoomDeleted = 'OneVsOneRoomDeleted',
    UndoRoomCreation = 'UndoRoomCreation',
    DeleteCreatedOneVsOneRoom = 'DeleteCreatedOneVsOneRoom',
    JoinOneVsOneRoom = 'JoinOneVsOneRoom',
    CheckIfAnyCoopRoomExists = 'CheckIfAnyCoopRoomExists',
    LimitedCoopRoomJoined = 'LimitedCoopRoomJoined',
    DeleteCreatedCoopRoom = 'DeleteCreatedCoopRoom',
    NoGameAvailable = "NoGameAvailable"
}

export enum PlayerStatus {
    Winner = 'Winner',
    Quitter = 'Quitter',
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
    Sent = 'Sent',
    Received = 'Received',
    Common = 'Common',
    Global = 'Global',
}
