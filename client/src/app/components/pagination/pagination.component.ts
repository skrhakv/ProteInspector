import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
    @Output() pagination = new EventEmitter<number>();
    @Input() disabled = true;
    @Input() pageCount: number = 0;

    public page: number = 0;

    constructor()
    {
        let pageFromSession: string | null = sessionStorage.getItem('page');
        if(pageFromSession)
        {
            let parsedPage: number = parseInt(pageFromSession);
            this.updatePagination(parsedPage);
        }
    }

    updatePagination(newPage: number):void {
        this.pagination.emit(newPage);
        this.page = newPage;
    }
}
