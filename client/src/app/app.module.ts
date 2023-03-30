import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { GameInfosComponent } from '@app/components/game-infos/game-infos.component';
import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { CanvasMiddleButtonsComponent } from './components/canvas-middle-buttons/canvas-middle-buttons.component';
import { CanvasTopButtonsComponent } from './components/canvas-top-buttons/canvas-top-buttons.component';
import { CanvasUnderButtonsComponent } from './components/canvas-under-buttons/canvas-under-buttons.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { GamePageDialogComponent } from './components/game-page-dialog/game-page-dialog.component';
import { ImageCanvasComponent } from './components/image-canvas/image-canvas.component';
import { JoinedPlayerDialogComponent } from './components/joined-player-dialog/joined-player-dialog.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { WaitingForPlayerToJoinComponent } from './components/waiting-player-to-join/waiting-player-to-join.component';
import { ConfigPageComponent } from './pages/config-page/config-page.component';
import { DeleteResetConfirmationDialogComponent } from './components/delete-reset-confirmation-dialog/delete-reset-confirmation-dialog.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        CreationPageComponent,
        MainPageComponent,
        SelectionPageComponent,
        GamePageComponent,
        GameSheetComponent,
        PlayerNameDialogBoxComponent,
        GameInfosComponent,
        ImageCanvasComponent,
        ConfigPageComponent,
        CreationGameDialogComponent,
        CanvasUnderButtonsComponent,
        GamePageDialogComponent,
        WaitingForPlayerToJoinComponent,
        CanvasTopButtonsComponent,
        JoinedPlayerDialogComponent,
        NavBarComponent,
        ChatBoxComponent,
        CanvasMiddleButtonsComponent,
        DeleteResetConfirmationDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatDialogModule,
        OverlayModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        MatGridListModule,
        MatExpansionModule,
        MatSelectModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
