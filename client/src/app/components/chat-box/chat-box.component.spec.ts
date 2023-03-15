import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatIconModule],
            declarations: [ChatBoxComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onAdd should emit trimmed value and reset input field', () => {
        const inputField = { value: 'ratel' };
        spyOn(component.add, 'emit');
        component.onAdd(inputField);

        expect(component.add.emit).toHaveBeenCalledWith('ratel');
        expect(inputField.value).toBe('');
    });

    it('onAdd should emit undefined if input value is falsy', () => {
        const inputField = {};
        spyOn(component.add, 'emit');
        component.onAdd(inputField as never);

        expect(component.add.emit).toHaveBeenCalledWith(undefined);
    });
});
