import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { HistoryBoxComponent } from './history-box.component';

describe('HistoryBoxComponent', () => {
    let component: HistoryBoxComponent;
    let fixture: ComponentFixture<HistoryBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatButtonToggleModule],
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
