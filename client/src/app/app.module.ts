import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { GameInfosComponent } from '@app/components/game-infos/game-infos.component';
import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { SoloGameViewComponent } from '@app/pages/solo-game-view/solo-game-view.component';
import { ImageCanvasComponent } from './components/image-canvas/image-canvas.component';
import { ImageValidationDialogComponent } from './components/image-validation-dialog/image-validation-dialog.component';
import { ConfigPageComponent } from './pages/config-page/config-page.component';
import { SoloGameViewDialogComponent } from './components/solo-game-view-dialog/solo-game-view-dialog.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';

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
        MaterialPageComponent,
        SidebarComponent,
        SelectionPageComponent,
        SoloGameViewComponent,
        GameSheetComponent,
        PlayerNameDialogBoxComponent,
        GameInfosComponent,
        ImageCanvasComponent,
        ImageValidationDialogComponent,
        ConfigPageComponent,
        CreationGameDialogComponent,
        SoloGameViewDialogComponent,
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
        MatGridListModule,
        MatExpansionModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
