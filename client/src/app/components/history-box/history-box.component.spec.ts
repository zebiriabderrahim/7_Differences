import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryBoxComponent } from './history-box.component';

describe('HistoryBoxComponent', () => {
    let component: HistoryBoxComponent;
    let fixture: ComponentFixture<HistoryBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoryBoxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
