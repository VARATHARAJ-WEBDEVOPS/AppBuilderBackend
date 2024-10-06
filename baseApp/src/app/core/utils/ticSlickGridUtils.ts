import { Injectable, OnInit } from '@angular/core';
import { AngularGridInstance, AngularUtilService, Column, Editors, FieldType, Filters, Formatters, GridOption } from 'angular-slickgrid';
import { firebaseProvider } from '../providers/firebaseprovider';
import { ObservableListenerUtils } from './ObservableListenerUtils';
import { LayoutConfiguration } from '../config/layoutConfigration';
import { LayoutActionButtonsComponent } from '../components/headerActionButtons/layoutActionButtons.component';
import { dataProvider } from '../providers/dataProvider';
import { get, uniqueId } from 'lodash';
import { LayoutLoadingAnimationComponent } from '../components/layout-loading-animation/layout-loading-animation.component';

@Injectable({
    providedIn: 'root',
})
export class ticSlickGridUtils implements OnInit {
    angularGrid!: AngularGridInstance;
    dataView: any;
    isLoading: boolean = true;
    gridOptions: GridOption;
    columnDefinitions: Column[] = []
      
    isFilterRowToggled: boolean = false;
    isPaginationReady: boolean = false;

    paginationInfo: {
        currentPage: number;
        totalPages: number;
        availablePages: number[];
        currentItemsPerPageNumber: number[];
        totalItems: number[];
        dataFrom: number | null;
        dataTo: number | null;
        pageNumber: number;
        currentPageNumber: number | null;
    } = {
            currentPage: 1,
            totalPages: 0,
            availablePages: [],
            currentItemsPerPageNumber: [],
            totalItems: [],
            dataFrom: null,
            dataTo: null,
            pageNumber: 0,
            currentPageNumber: null
        }
    columFieldInfo: any[] = [

    ];

    constructor(private angularUtilService: AngularUtilService ,private firebaseProvider: firebaseProvider, private observableListenerUtils: ObservableListenerUtils, public layoutConfig: LayoutConfiguration, private dataProvider: dataProvider) {
        this.gridOptions = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            autoEdit: false,
            autoCommitEdit: true,
            editable: true,
            enableAutoSizeColumns: true,
            
            enableAutoTooltip: true,
            enableFiltering: true,
            formatterOptions: {
                dateSeparator: '/'
            },

            asyncEditorLoading: false,
            asyncPostRenderDelay: 0,


            enableAutoResize: true,
            autoResize: {
                container: '#demo-container',
                rightPadding: 10
            },
            // headerMenu: { hideFreezeColumnsCommand: false, hideColumnHideCommand: true },
            enableSorting: true,
            headerRowHeight: 43,
            showHeaderRow: false,
            rowHeight: 50,
            enablePagination: true,
            pagination: {
                pageSizes: [5, 10, 20, 25, 50, 1000, 2000],
                pageSize: 5,
            },

            enableExcelExport: true,
            excelExportOptions: {
                sanitizeDataExport: true
            },
            // registerExternalResources: [this.excelExportService, this.exportService],
            enableTextExport: true,
            exportOptions: {
                sanitizeDataExport: true
            },
            // createPreHeaderPanel: true,
            // showPreHeaderPanel: true,
            // preHeaderPanelHeight: 70,
            // enableGrouping: true,
            // enableDraggableGrouping: true,

            // draggableGrouping: {
            //     dropPlaceHolderText: 'Drop a column header here to group by the column',
            //     deleteIconCssClass: 'mdi mdi-close text-color-danger',
            //     hideToggleAllButton: true,
            // },

        };
    }

    ngOnInit(): void {

    }

    prepareGrid(sectionObjectInfo: any) {
        this.columnDefinitions = sectionObjectInfo.columnFieldInfo.map(info => {
            let columnDef: any = {
              id: get(info, 'fieldName'),
              name: info.fieldDisplayName,
              field: get(info, 'fieldName'),
              sortable: info.sortable || false,
              type: info.fieldType,
              formatter: sectionObjectInfo.isLazzyLoading ? this.loadingAnimationFormatter.bind(this) : info.fieldType === 'action' ? this.actionButtonFormatter.bind(this) : this.setNestedOject.bind(this),
              filterable: info.fieldType === "action" ? false : true,
              minWidth: 200,
              filter: { model: Filters.compoundInput },
              editor: info.fieldType === "action" ? {} : { model: Editors.text },
              params: {
                buttonInfoSet: info.fieldType === "action" ? info.buttonInfoSet : []
              },
            };
            return columnDef;
          });
 
        console.log(this.columnDefinitions);
        

    }
    
    loadingAnimationFormatter(row: number, cell: number, value: any, columnDef: any, dataContext: any): any {
        const uniqueId = `lazzy-loading-${row}-${cell}`;
        
        const shouldShowLoading = !(value && value.id);
        
        const returnDom = shouldShowLoading ? `<div id="${uniqueId}" style="height: 100%; width: 100%;"></div>` : '';
    
        if (shouldShowLoading) {
            // Delay the component creation to allow the DOM to render first
            setTimeout(() => {
                const container = document.getElementById(uniqueId);
                if (container) {
                    this.angularUtilService.createAngularComponentAppendToDom(
                        LayoutLoadingAnimationComponent, 
                        container, 
                        true
                    );
                }
            }, 50);
        }
    
        return returnDom;
    }
    

    setNestedOject(row: number, cell: number, value: any, columnDef: any, dataContext: any): string {
        const fieldPath = columnDef['field'];
        const keys = fieldPath.split('.'); 

        let nestedObject = dataContext?.[keys?.[0]]?.[keys?.[1]]
        return nestedObject ? nestedObject : "";
    }

    actionButtonFormatter(row: number, cell: number, value: any, columnDef: any, dataContext: any): string {
        const fieldPath = columnDef['field'];
        const keys = fieldPath.split('.'); 
        let nestedObject = dataContext?.[keys?.[0]];
        const uniqueId = `action-buttons-${row}-${cell}`;
        setTimeout(() => {
          const container = document.getElementById(uniqueId);
          if (container) {
            // Create and append the Angular component to the DOM
            const componentOutput = this.angularUtilService.createAngularComponentAppendToDom(
              LayoutActionButtonsComponent, 
              container, 
              true
            );
    
            // Access componentRef to set @Input properties
            const componentInstance = componentOutput.componentRef.instance;
            componentInstance.buttonData = columnDef.params.buttonInfoSet;
            componentInstance.parentContext = this;
            componentInstance.dataContext = nestedObject;

          }
        }, 0);
        const retunDom = value && value.id ? '' : `<div id="${uniqueId}"></div>`
        return retunDom
      }

    onAngularGridCreated(angularGrid: any, parentContext: any) {
        parentContext.sectionObjectInfo.gridInstance = angularGrid.detail;
        this.angularGrid = angularGrid.detail;
        this.paginationService.totalItems = 1;
        this.dataView = this.angularGrid.dataView;
    
        if (this.dataView) {
            // Initialize Lazy loading and data observation
            // this.startLazyLoading(sectionObjectInfo.listenerName);
            this.startObserveData(parentContext);
            this.startLazyLoading(parentContext.sectionObjectInfo.listenerName);
            this.loadData(parentContext)
        }
    }
    

    gridStateChanged(gridStateChanges?: any) {
        let paginationValues = this.paginationService.getFullPagination();
        this.paginationInfo.totalItems = paginationValues.totalItems
        this.paginationInfo.dataFrom = this.paginationService.dataFrom
        this.paginationInfo.dataTo = this.paginationService.dataTo
        this.paginationInfo.totalPages = this.paginationService.pageCount
        this.paginationInfo.pageNumber = this.paginationService.pageNumber
        this.paginationInfo.currentPageNumber = this.paginationService.getCurrentPageNumber();
    }

    get paginationService(): any {
        return this.angularGrid.paginationService;
    }

    updateSlickGrid(data: any[], parentContext: any) {
     
        this.dataView.beginUpdate();
        let transformedData: any[] = [];
    
        data.forEach((item: any) => {
            transformedData.push(item);
        })
        transformedData.forEach(element => {
            if (this.dataView) {
                const value = this.dataView.getItemById(element['id']);
                if (value) {
                    this.dataView.updateItem(element['id'], element);
                } else {
                    element.id = uniqueId()
                    this.dataView.addItem(element);
                }
            }
        });
    
        this.dataView.endUpdate();
        // this.angularGrid.refreshGridData(this.dataset);
        this.updatePaginationInfo();
        console.log("After update:", this.dataView.getItems());
        // parentContext.sectionObjectInfo.isLazzyLoading = false
        console.log(parentContext.sectionObjectInfo.isLazzyLoading);
        
    }
    

    startObserveData(parentContext: any) {
        this.observableListenerUtils.subscribeToListener(parentContext.sectionObjectInfo.listenerName, (data) => {
            this.updateSlickGrid(data, parentContext);
        });
    }

    loadData(parentContext: any) {
        this.dataProvider.listFetch(parentContext.sectionObjectInfo['searchQuery'], parentContext.sectionObjectInfo['objectHierarchy'], [])
          .then(data => {
            if (data) {
                if (parentContext.sectionObjectInfo.isLazzyLoading) {
                this.stopLazyLoading(parentContext)
                }
                this.observableListenerUtils.notifyListeners(parentContext.sectionObjectInfo.listenerName, data);
            }
          })
          .catch(error => {
            console.error('Error loading data:', error);
          });
      }

      stopLazyLoading(parentContext: any) {
        try {
            parentContext.sectionObjectInfo.isLazzyLoading = false;
            let lazyLoadData = this.dataView.getItems();
            this.dataView.beginUpdate();
            const idsToDelete = lazyLoadData.map(data => data['id']);
            idsToDelete.forEach(id => {
                this.dataView.deleteItem(id);
            });
            this.dataView.endUpdate();
            this.observableListenerUtils.notifyListeners(parentContext.sectionObjectInfo.listenerName, []);
            this.prepareGrid( parentContext.sectionObjectInfo)
        } catch (error) {
            console.error('Error during lazy loading stop:', error);
        }
    }
    
    updatePaginationInfo() {
        // this.angularGrid.paginationService?.togglePaginationVisibility(false);
        this.paginationInfo.availablePages = this.paginationService.availablePageSizes;
        this.paginationInfo.totalItems = this.paginationService.totalItems
        let paginationValues = this.paginationService.getFullPagination();
        this.paginationInfo.totalItems = paginationValues.totalItems
        this.paginationInfo.dataFrom = this.paginationService.dataFrom
        this.paginationInfo.dataTo = this.paginationService.dataTo
        this.paginationInfo.totalPages = this.paginationService.pageCount
        this.paginationInfo.pageNumber = this.paginationService.pageNumber
        this.paginationInfo.currentPageNumber = this.paginationService.getCurrentPageNumber();
        this.isPaginationReady = true
    }

    startLazyLoading(listenerName: string) {
        let lazyData: any[] = [];
        for (let i = 0; i < 10; i++) {
            lazyData.push({
                id: i,
            });
        }
        this.observableListenerUtils.notifyListeners(listenerName, lazyData);
    }

    getTextWidth(text: string): number {
        // Create a temporary element to measure the text width
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            context.font = '14px Arial';  // You can customize the font size and family
            return context.measureText(text || '').width;
        }
        return 0;
    }

    nextPage() {
        this.paginationService.goToNextPage();
    }

    previousPage() {
        this.paginationService.goToPreviousPage();
    }

    changeItemPerPage(page: any) {
        this.paginationService.changeItemPerPage(page.value);
    }

    isFirstPage(): boolean {
        return this.paginationService.pageNumber === 1;
    }

    isLastPage(): boolean {
        return this.paginationService.pageNumber === this.paginationService.pageCount;
    }

    toggleFilterRow() {
        this.isFilterRowToggled = !this.isFilterRowToggled;
        this.angularGrid.filterService.toggleHeaderFilterRow();
    }
}