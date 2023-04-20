import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'create', component: CreationPageComponent },
    { path: 'selection', component: SelectionPageComponent },
    { path: 'config', component: ConfigPageComponent },
    { path: 'limited', component: LimitedTimePageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
