import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PaginationComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should update page number', () => {
        component.updatePagination(1);
        expect(component.page).toBe(1);
    });
    it('should disable two buttons', () => {
        component.updatePagination(0);
        component.pageCount = 100;
        component.disabled = false;
        expect(component.page).toBe(0);

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const compiled = fixture.nativeElement as HTMLElement;
            const a = compiled.querySelectorAll('.disabled').length;
            expect(a).toEqual(2);
        });
    });

    it('should disable four buttons buttons', () => {
        component.updatePagination(0);
        component.pageCount = 1;
        component.disabled = false;
        expect(component.page).toBe(0);

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            const compiled = fixture.nativeElement as HTMLElement;
            const a = compiled.querySelectorAll('.disabled').length;
            expect(a).toEqual(4);
        });
    });

});
