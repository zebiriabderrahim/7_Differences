import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CreationGameDialogComponent } from './creation-game-dialog.component';

describe('CreationGameDialogComponent', () => {
    let component: CreationGameDialogComponent;
    let fixture: ComponentFixture<CreationGameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [CreationGameDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
