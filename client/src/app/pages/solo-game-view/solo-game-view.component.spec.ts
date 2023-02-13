import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';

import { SoloGameViewComponent } from './solo-game-view.component';

describe('SoloGameViewComponent', () => {
    let component: SoloGameViewComponent;
    let fixture: ComponentFixture<SoloGameViewComponent>;
    // let mouse: MouseEvent;
    // let gameArea: GameAreaService;
    // let classicService: ClassicSystemService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [SoloGameViewComponent],
            providers: [GameAreaService, ClassicSystemService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoloGameViewComponent);
        component = fixture.componentInstance;
        // gameArea = TestBed.inject(GameAreaService);
        // classicService = TestBed.inject(ClassicSystemService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
