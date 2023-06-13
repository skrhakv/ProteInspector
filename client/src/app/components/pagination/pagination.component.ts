import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
    @Output() pagination = new EventEmitter<number>();
    @Input() disabled = true;
    @Input() pageCount = 0;

    public page = 0;

    constructor()
    {
        const pageFromSession: string | null = sessionStorage.getItem('page');
        
        // check whether page was defined or not
        if(pageFromSession)
        {
            const parsedPage: number = parseInt(pageFromSession);
            this.updatePagination(parsedPage);
        }
    }

    updatePagination(newPage: number):void {
        this.pagination.emit(newPage);
        this.page = newPage;
    }
}
