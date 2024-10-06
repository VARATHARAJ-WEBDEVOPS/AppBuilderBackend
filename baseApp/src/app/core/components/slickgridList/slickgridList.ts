// src/app/pages/testEntry/testEntry_Entry.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { firebaseProvider } from '../../providers/firebaseprovider';
import { AngularGridInstance, Column, Editors, Filters, GridOption, PaginationService } from 'angular-slickgrid';
import { ticSlickGridUtils } from '../../utils/ticSlickGridUtils';

@Component({
    selector: 'tic-slickgridList',
    templateUrl: './slickgridList.html',
    styleUrl: './slickgridList.css'
})
export class slickgridList implements OnInit {

    @Input() sectionObjectInfo
    @Input() parentContext

    constructor( public ticSlickGridUtils:ticSlickGridUtils, private firebaseProvider: firebaseProvider) {
        
    }

    ngOnInit(): void {
        this.ticSlickGridUtils.prepareGrid(this.sectionObjectInfo);
    }

}
