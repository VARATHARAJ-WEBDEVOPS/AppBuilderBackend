const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Constants
const ignoredDirectories = ['node_modules', '.git', 'dist', '.vscode', '.idea'];
const baseAppPath = path.join(__dirname, 'baseApp'); // Use absolute path

app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Function to copy the baseApp directory to the archive
const copyBaseAppToArchive = (archive) => {
  const copyDirectory = (source, archive, basePath = '') => {
    if (!fs.existsSync(source)) {
      console.error(`Directory ${source} does not exist.`);
      return;
    }

    fs.readdirSync(source, { withFileTypes: true }).forEach(dirent => {
      const sourcePath = path.join(source, dirent.name);
      const archivePath = path.join(basePath, dirent.name);

      if (ignoredDirectories.includes(dirent.name)) {
        return; // Skip ignored directories
      }

      if (dirent.isDirectory()) {
        copyDirectory(sourcePath, archive, archivePath);
      } else {
        const fileContent = fs.readFileSync(sourcePath);
        archive.append(fileContent, { name: archivePath });
      }
    });
  };

  copyDirectory(baseAppPath, archive);
};

const basicAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).send('credentials needed');
  }

  const base64Credentials = authHeader.split(' ')[1]; // Extract base64 encoded credentials
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Replace these values with your desired username and password
  const validUsername = 'vasandhu';
  const validPassword = '12345678';

  // Validate the credentials
  if (username === validUsername && password === validPassword) {
    return next(); // Continue to the next middleware
  } else {
    return res.status(401).send('Invalid credentials');
  }
};

// Endpoint to receive JSON configuration and create project
app.post('/download-project',basicAuth, (req, res) => {
  const metaJson = req.body; // Use the body as the metaJson

  // Create a ZIP file in memory
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  res.attachment(`${metaJson.applicationName}.zip`);
  archive.pipe(res);

  // Copy baseApp contents into the archive
  copyBaseAppToArchive(archive);

  // Add dynamic pages and configuration to the archive
  const pagesPath = 'src/app/pages';
  const appRoutingModulePath = 'src/app/app-routing.module.ts';
  const appComponentPath = 'src/app/app.component.ts';
  const menuConfigrationPath = 'src/app/core/config/menuConfigration.ts';
  const layoutConfigrationPath = 'src/app/core/config/layoutConfigration.ts';

  // Create layout directories and files in memory
  metaJson.pages.forEach(page => {
    if (page.layoutType == "ENTRY") {  // entry
      const layoutDirectory = `${page.layoutName}_${page.layoutType}`;
      const layoutPath = path.join(pagesPath, layoutDirectory);

      // Define file names
      const htmlFile = `${layoutDirectory}.html`;
      const tsFile = `${layoutDirectory}.ts`;
      const moduleFile = `${layoutDirectory}.module.ts`;
     //entry.html

     let htmlTemplateFields = ``;

     page.templateDetails.forEach(row => {

      if (row[0]['type']!=="heading") {
        htmlTemplateFields += `<div class="row" *ngIf="isSkeletonLoading">`;
         row.forEach((col)=>{
          htmlTemplateFields += `<div class="inputContainer">
                                    <span class="fieldNameSkeleton "></span>
                                     <div class="inputFieldSkeleton "></div>
                                  </div>`;
         })
        htmlTemplateFields +=  `</div>`;
      }

      htmlTemplateFields += `<div class="row ${row.length===1 && row[0]['type']==="heading" ? 'sectionHeader heading-element"' : '" *ngIf="!isSkeletonLoading"'} >`;
      if (row.length===1 && row[0]['type']==="heading") {
      htmlTemplateFields += `<span>${row[0]['fieldDisplayName']}</span>`;
      }

        row.forEach(col => {
          if (col.type === 'text' || col.type === 'number' || col.type === 'date') {
            htmlTemplateFields += `
              <div class="inputContainer" formGroupName="${col.formGroupName}">
                <span>${col.fieldDisplayName} ${col.isisRequired ? '<span class="isRequired">*</span>' : ''}</span>
                <input type="${col.type}" ${col.isReadOnlyField ? 'class="readOnlyTextBox" readonly' : ''} formControlName="${col.formControlName}">
              </div>`;
          } else if (col.type === 'textarea') {
             htmlTemplateFields += `
              <div class="inputContainer" formGroupName="${col.formGroupName}">
                     <span>${col.fieldDisplayName} ${col.isRequired ? '<span class="isRequired">*</span>' : ''}</span>
                    <textarea id="myTextarea" name="myTextarea" rows="4" cols="50" formControlName="${col.formControlName}">
                        Enter address here...
                    </textarea>                        
              </div>
             `;
          } else if (col.type === 'singleSelect' || col.type === 'multiSelect') {
            htmlTemplateFields  += `
            <div class="inputContainer" formGroupName="${col.formGroupName}">
              <span>${col.fieldDisplayName} ${col.isRequired ? '<span class="isRequired">*</span>' : ''}</span>
              <mat-form-field appearance="fill" class="no-underline">
                <mat-select ${col.type === 'singleSelect' ? 'single' : 'multiple'} formControlName="${col.formControlName}" class="custom-select">
                <mat-option *ngFor="let mappedDetail of mappingDetails['employee_DUMMY.qualification']" 
                  [value]="mappedDetail.value" 
                  [matTooltip]="mappedDetail.displayName" 
                  matTooltipPosition="before" class="custom-option">
                  {{ mappedDetail.displayName }}
                </mat-option>`;
                htmlTemplateFields += `
                </mat-select>
              </mat-form-field>
            </div>`;
          } else if (col.type === 'radio') {
            // Handle radio buttons
            htmlTemplateFields += `
              <div class="inputContainer" formGroupName="${col.formGroupName}">
                <span>${col.fieldDisplayName} ${col.isRequired ? '<span class="isRequired">*</span>' : ''}</span>
                <mat-radio-group formControlName="${col.formControlName}">
                    <mat-radio-button class="example-radio-button" *ngFor="let mapedDetail of ${col.optionsSource}" [value]="mapedDetail.value" [matTooltip]="mapedDetail.displayName" matTooltipPosition="above">
                        {{mapedDetail.displayName}}
                    </mat-radio-button>
                </mat-radio-group>
              </div>`;
          } else if (col.type === 'boolean') {
            htmlTemplateFields += `
              <div class="inputContainer" formGroupName="${col.formGroupName}">
                <span>${col.fieldDisplayName} ${col.isRequired ? '<span class="isRequired">*</span>' : ''}</span>
                <mat-slide-toggle formControlName="${col.formControlName}" [color]="'primary'"></mat-slide-toggle>
              </div>`;
          }
        })
        htmlTemplateFields += `
      </div>`;
     })

      archive.append(`
<div class="dummyHeader"></div>
<div class="dummyHeader"></div>
<div class="pageHeader">
    <div class="pageTitle">
        <h2>{{layoutDisplayName}}</h2>
    </div>
    <div class="pageButtonGroup">
      <app-layout-action-buttons [buttonData]="headerActionInfo" [parentContext]="this"></app-layout-action-buttons>
    </div>
</div>
<div class="applicationContainer">
    <div class="section" [formGroup]="${page.sectionName}">
      <div class="sectionHeader">
        <span>${page.sectionDisplayName}</span>
      </div>
      <div class="sectionContent">
          ${htmlTemplateFields}
      </div>
    </div>
</div>
        `, { name: path.join(layoutPath, htmlFile) });
      //entry.ts
      archive.append(`
import { Component, OnInit } from '@angular/core';
import { AppUtility } from '../../core/utils/appUtility.service';
import { LayoutConfiguration } from '../../core/config/layoutConfigration';
import { cloneDeep } from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { firebaseProvider } from '../../core/providers/firebaseprovider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { dataProvider } from '../../core/providers/dataProvider';
@Component({
  selector: '${layoutDirectory}',
  templateUrl: './${htmlFile}',
})
export class ${layoutDirectory} implements OnInit {
  recordId: string = "";
  recordRev: any;
  dirtyStatus!: { [key: string]: boolean; };
  isSkeletonLoading: boolean = false;

  constructor(public dataProvider: dataProvider, public appUtils: AppUtility, private route: ActivatedRoute, public layoutConfig: LayoutConfiguration, public fb: FormBuilder, private firebaseProvider: firebaseProvider, private snackBar: MatSnackBar) {
    ${page.Sections}
  }
  
  showSnackBar(message: string, duration?) {
    this.snackBar.open(message, 'Close', {
      duration: duration ? duration : 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['data'] !== undefined && JSON.parse(params['data']).id) {
        this.recordId = JSON.parse(params['data']).id;
        if (this.recordId) {
          this.fetchForEditRecord().then((res: any) => {
            if (res) {
              this.showSnackBar("data fetch successfully", 3000);
              this.isSkeletonLoading = false
            }
          })
        }
      }
    });
  } 

  async fetchForEditRecord() {
  this.isSkeletonLoading = !!this.recordId;
  
  try {
    const res = await this.dataProvider.fetch(this.objectHierarchy, this.recordId, this);
    this.updateFormDataAfterSave(this.dataObject, this.${page.sectionName});
      return res;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isSkeletonLoading = false;
    }
  }

  updateFormDataAfterSave(dataObject: any, formGroup: FormGroup) {
    Object.keys(dataObject).forEach(sectionKey => {
      const sectionValue = dataObject[sectionKey];

      // Check if the form group has the section
      const sectionControl = formGroup.controls[sectionKey];
      if (sectionControl) {
        Object.keys(sectionValue).forEach(fieldKey => {
          // Check if the form control exists for each field within the section
          const fieldControl = sectionControl.get(fieldKey);
          if (fieldControl) {
            fieldControl.setValue(sectionValue[fieldKey]);
          }
        });
      }
    });
  }
  ${page.sectionName}!: FormGroup;
  layoutName = "${layoutDirectory}";
  layoutDisplayName = this.layoutConfig.layoutConfiguration[this.layoutName]['layoutDisplayName'];
  headerActionInfo: any = cloneDeep(this.layoutConfig.layoutConfiguration[this.layoutName]['headerActionInfo']);
  mappingDetails: any = cloneDeep(this.layoutConfig.layoutConfiguration[this.layoutName]['mappingDetails']);

  objectHierarchy = ${JSON.stringify(page.objectHierarchy, null, 2)};

  dataObject: any = {}

    save() {
    this.appUtils.isMainloading = true;
    let saveData: any[] = [this.${page.sectionName}.value];
    this.dirtyStatus = this.checkFormDirtyStatus();
    this.setDataObject(saveData);
    console.log('Data Object to Save:', this.dataObject); // Debugging Log
    this.isSkeletonLoading = true;
    this.dataProvider.handleSave(saveData, this.objectHierarchy[0], "", this)
      .then(response => {
        console.log('Primary object saved with ID and Rev:', response); // Debugging Log
        this.recordId = response.id;
        this.recordRev = response.rev;
        this.fetchForEditRecord()
        this.appUtils.isMainloading = false;
        this.isSkeletonLoading = false;
        let saveToast = this.recordId !== "" ? 'Record Updated successfully' : 'Record saved successfully';
        this.showSnackBar(saveToast);
      })
      .catch(error => {
        console.error('Error during save:', error); // Debugging Log

        // Show conflict or any other error message
        this.showSnackBar(error, 6000);
        this.appUtils.isMainloading = false;
        this.isSkeletonLoading = false;
      });
  }

  setDataObject(saveData: any) {
    saveData.forEach((section: any) => {
      const sectionCopy = { ...section };
      Object.keys(sectionCopy).forEach((key: string) => {
        if (!this.dataObject[key]) {
          this.dataObject[key] = { ...sectionCopy[key] };
          this.dataObject[key]['id'] = this.dataObject[key]['id'] ? this.dataObject[key]['id'] : "";
          this.dataObject[key]['rev'] = this.dataObject[key]['rev'] ? this.dataObject[key]['rev'] : "";
        } else {
          this.dataObject[key]['id'] = this.dataObject[key]['id'] ? this.dataObject[key]['id'] : "";
          this.dataObject[key]['rev'] = this.dataObject[key]['rev'] ? this.dataObject[key]['rev'] : "";
        }
      });
    });
  }

  checkFormDirtyStatus(): { [key: string]: boolean } {
  const formStatus: { [key: string]: boolean } = {};
  const mainGroup = this.${page.sectionName};

  Object.keys(mainGroup.controls).forEach((groupName) => {
      const group = mainGroup.get(groupName) as FormGroup;

      if (group) {
        if (this.dataObject[groupName]) {
          const compareOldData = JSON.parse(JSON.stringify(this.dataObject[groupName]));
          delete compareOldData.id;
          delete compareOldData.rev;
          const currentData = JSON.parse(JSON.stringify(group.value));
          Object.keys(currentData).forEach((key) => {
            if (currentData[key] === null) {
              delete currentData[key];
            }
          });
          Object.keys(compareOldData).forEach((key) => {
            if (compareOldData[key] === null) {
              delete compareOldData[key];
            }
          });
          formStatus[groupName] = !this.objectsAreEqual(currentData, compareOldData);
        } else {
          formStatus[groupName] = false;
        }
      }
    });
    console.log(formStatus);
    return formStatus;
  }
  private objectsAreEqual(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  }
}`, { name: path.join(layoutPath, tsFile) });
//entrymodule.ts
      archive.append(`
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { LayoutActionButtonsModule } from '../../core/components/headerActionButtons/headerActionButtons.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { firebaseConfig } from '../../core/config/firebaseConfig';
import { firebaseProvider } from '../../core/providers/firebaseprovider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule} from '@angular/material/radio';
import { dataProvider } from '../../core/providers/dataProvider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { ${layoutDirectory} } from './${layoutDirectory}';
                    
  const routes: Routes = [
    { path: '', component: ${layoutDirectory} }
  ];
                    
  @NgModule({
    declarations: [${layoutDirectory}],
    imports: [
      CommonModule,
      MatButtonModule,
      LayoutActionButtonsModule,
      ReactiveFormsModule,
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFireDatabaseModule,
      MatSnackBarModule,
      MatTooltipModule,
      MatRadioModule,
      MatSlideToggleModule,
      MatSelectModule,
      RouterModule.forChild(routes)
    ],
    providers:[firebaseProvider, dataProvider, {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: { color: 'primary' },
    }],
  })
  export class ${layoutDirectory}Module { }
                            `, { name: path.join(layoutPath, moduleFile) });
    } else if (page.layoutType == "LIST") {
      const layoutDirectory = `${page.layoutName}_${page.layoutType}`;
      const layoutPath = path.join(pagesPath, layoutDirectory);

      // Define file names
      const htmlFile = `${layoutDirectory}.html`;
      const tsFile = `${layoutDirectory}.ts`;
      const moduleFile = `${layoutDirectory}.module.ts`;
  // list.html
      archive.append(`
<div class="dummyHeader"></div>
<div class="dummyHeader"></div>
<div class="pageHeader">
  <div class="pageTitle">
    <h2>{{layoutDisplayName}}</h2>
  </div>
  <div class="pageButtonGroup">
    <app-layout-action-buttons [buttonData]="headerActionInfo" [parentContext]="this"></app-layout-action-buttons>
  </div>
</div>
<div class="applicationContainer">
  <div class="section">
    <div class="sectionHeader">
      <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
        <div
          style=" border-right: 2px solid #dedede; display: flex; justify-content: center; align-items: center; height: 50%;">
          <span style="margin-right: 3.5vh;">${page.sectionDisplayName}</span>
        </div>

        <button style="margin-left: 3.5vh; " mat-mini-fab color="primary" class="ticHeaderButtons"
          matTooltip="Grid Menu">
          <mat-icon>menu</mat-icon>
        </button>
      </div>

      <div style="display: flex; justify-content: center; align-items: center;" *ngIf="!sectionObjectInfo.isLazzyLoading">
        <div class="paginationDetails" style="display: flex; justify-content: center; align-items: center;">
          <span>Item per page: </span>&nbsp;&nbsp;
          <select class="paginationSelect" (change)="ticSlickGridUtils.changeItemPerPage($event.target)">
            <option *ngFor="let page of ticSlickGridUtils.paginationInfo.availablePages" [value]="page">{{page}}
            </option>
          </select>&nbsp;&nbsp;&nbsp;&nbsp;
          <span>{{ticSlickGridUtils.paginationInfo.dataFrom}} - {{ticSlickGridUtils.paginationInfo.dataTo}} of
            {{ticSlickGridUtils.paginationInfo.totalItems}}</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <span>{{ticSlickGridUtils.paginationInfo.pageNumber}}/{{ticSlickGridUtils.paginationInfo.totalPages}}
            Page</span>
        </div>
        <button *ngIf="ticSlickGridUtils.isPaginationReady" mat-mini-fab style="margin-left: 3.5vh;" color="primary"
          class="ticHeaderButtons" [disabled]="ticSlickGridUtils.isFirstPage()"
          (click)="ticSlickGridUtils.previousPage()" matTooltip="Prev Page">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button *ngIf="ticSlickGridUtils.isPaginationReady" mat-mini-fab style="margin-left: 3.5vh;" color="primary"
          class="ticHeaderButtons" [disabled]="ticSlickGridUtils.isLastPage()" (click)="ticSlickGridUtils.nextPage()"
          matTooltip="Next Page">
          <mat-icon>chevron_right</mat-icon>
        </button>
        <button *ngIf="!ticSlickGridUtils.isFilterRowToggled" style="margin-left: 3.5vh; " mat-mini-fab color="primary"
          class="ticHeaderButtons" (click)="ticSlickGridUtils.toggleFilterRow()" matTooltip="Open Filter">
          <mat-icon>filter_alt</mat-icon>
        </button>
        <button *ngIf="ticSlickGridUtils.isFilterRowToggled" style="margin-left: 3.5vh; " mat-mini-fab color="primary"
          class="ticHeaderButtons" (click)="ticSlickGridUtils.toggleFilterRow()" matTooltip="Close Filter">
          <mat-icon>filter_alt_off</mat-icon>
        </button>
      </div>
    </div>
    <div class="sectionContent">
      <div class="listContainer">
        <tic-slickgridList [sectionObjectInfo]="sectionObjectInfo" [parentContext]="this"></tic-slickgridList>
      </div>
    </div>
  </div>
</div>
        `, { name: path.join(layoutPath, htmlFile) });
      // list.ts
      archive.append(`
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { LayoutConfiguration } from '../../core/config/layoutConfigration';
import { v4 as uuidv4 } from 'uuid';
import { ticSlickGridUtils } from '../../core/utils/ticSlickGridUtils';

@Component({
  selector: '${layoutDirectory}',
  templateUrl: './${htmlFile}',
})
export class ${layoutDirectory} {
  layoutName = "${layoutDirectory}"; 
  layoutDisplayName = this.layoutConfig.layoutConfiguration[this.layoutName]['layoutDisplayName']; 
  headerActionInfo: any = cloneDeep(this.layoutConfig.layoutConfiguration[this.layoutName]['headerActionInfo']);
  columnFieldInfo: any = cloneDeep(this.layoutConfig.layoutConfiguration[this.layoutName]["columnFieldInfo"]);
    
  constructor(public ticSlickGridUtils: ticSlickGridUtils, public layoutConfig: LayoutConfiguration) {}

  objectHierarchy = ${JSON.stringify(page.objectHierarchy, null, 2)};

  sectionObjectInfo = {
    listenerName: this.layoutName + uuidv4(),
    layoutName: this.layoutName,
    searchQuery: "${page.searchQuery}",
    columnFieldInfo: this.columnFieldInfo,
    objectHierarchy: this.objectHierarchy,
    isLazzyLoading: true,
    gridInstance: {}
  }
}
                  `, { name: path.join(layoutPath, tsFile) });
                  // ListModule.ts 
      archive.append(`
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from '../../core/config/firebaseConfig';
import { firebaseProvider } from '../../core/providers/firebaseprovider';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { LayoutActionButtonsModule } from '../../core/components/headerActionButtons/headerActionButtons.module';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { slickgridListModule } from '../../core/components/slickgridList/slickgrid.module';
import { ticSlickGridUtils } from '../../core/utils/ticSlickGridUtils';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { dataProvider } from '../../core/providers/dataProvider';
import { ${layoutDirectory} } from './${layoutDirectory}';
                    
  const routes: Routes = [
    { path: '', component: ${layoutDirectory} }
  ];
                    
@NgModule({
  declarations: [${layoutDirectory}],
  imports: [
  CommonModule,
    RouterModule.forChild(routes),
    LayoutActionButtonsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularSlickgridModule.forRoot(),
    AngularFireDatabaseModule,
    slickgridListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  providers:[firebaseProvider, ticSlickGridUtils, dataProvider]
})
export class ${layoutDirectory}Module { }
                            `, { name: path.join(layoutPath, moduleFile) });
    } else if (page.layoutType == "VIEW") {
      const layoutDirectory = `${page.layoutName}_${page.layoutType}`;
      const layoutPath = path.join(pagesPath, layoutDirectory);

      // Define file names
      const htmlFile = `${layoutDirectory}.html`;
      const tsFile = `${layoutDirectory}.ts`;
      const moduleFile = `${layoutDirectory}.module.ts`;
      let htmlTemplateFields = ``;
      page.templateDetails.forEach(row => {
        if (row[0]['type']!=="heading") {
          htmlTemplateFields += `<div class="row" *ngIf="isSkeletonLoading">`;
           row.forEach((col)=>{
            htmlTemplateFields += `<div class="inputContainer">
                                      <span class="fieldNameSkeleton "></span>
                                       <div class="inputFieldSkeleton "></div>
                                    </div>`;
           })
          htmlTemplateFields +=  `</div>`;
        }
        htmlTemplateFields += `<div class="row ${row.length===1 && row[0]['type']==="heading" ? 'sectionHeader heading-element"' : '" *ngIf="!isSkeletonLoading"'} >`;
        if (row.length===1 && row[0]['type']==="heading") {
        htmlTemplateFields += `<span>${row[0]['fieldDisplayName']}</span>`;
        }

        row.forEach(col => {
          if (col.type !== 'heading') {
           htmlTemplateFields += ` <div class="inputContainer">
            <span>${col.fieldDisplayName}</span>
            <div class="viewBox">
                {{${col.dataPath}}}
            </div>
        </div>`
          }
        });
        htmlTemplateFields += `</div>`
      })
    // view.html
      archive.append(`
<div class="dummyHeader"></div>
<div class="dummyHeader"></div>
<div class="pageHeader">
    <div class="pageTitle">
        <h2>{{layoutDisplayName}}</h2>
    </div>
    <div class="pageButtonGroup">
        <app-layout-action-buttons [buttonData]="headerActionInfo" [parentContext]="this"></app-layout-action-buttons>
    </div>
</div>
<div class="applicationContainer">
    <div class="section">
        <div class="sectionHeader">
            <span>${page.sectionDisplayName}</span>

        </div>
        <div class="sectionContent">
          ${htmlTemplateFields}
        </div>
    </div>
</div>
        `, { name: path.join(layoutPath, htmlFile) });
      // view.ts
      archive.append(`
import { Component, OnInit } from '@angular/core';
import { LayoutConfiguration } from '../../core/config/layoutConfigration';
import { cloneDeep } from 'lodash';
import { firebaseProvider } from '../../core/providers/firebaseprovider';
import { ActivatedRoute } from '@angular/router';
import { dataProvider } from '../../core/providers/dataProvider';
import { MatSnackBar } from '@angular/material/snack-bar';
          
@Component({
  selector: '${layoutDirectory}',
  templateUrl: './${htmlFile}',
})
export class ${layoutDirectory} implements OnInit {
  layoutName = "${layoutDirectory}";
  layoutDisplayName = this.layoutConfig.layoutConfiguration[this.layoutName]['layoutDisplayName']; 
  headerActionInfo: any = cloneDeep(this.layoutConfig.layoutConfiguration[this.layoutName]['headerActionInfo']);
  dataObject: any = {};
  recordId: string = ""
  isSkeletonLoading: boolean = false
  
  constructor( private snackBar: MatSnackBar, public dataProvider: dataProvider, private route: ActivatedRoute, public layoutConfig: LayoutConfiguration, private firebaseProvider: firebaseProvider) { }

  objectHierarchy = ${JSON.stringify(page.objectHierarchy, null, 2)};
  showSnackBar(message: string, duration?) {
    this.snackBar.open(message, 'Close', {
      duration: duration ? duration : 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['data'] !== undefined && JSON.parse(params['data']).id) {
        this.recordId = JSON.parse(params['data']).id;
        if (this.recordId) {
         this.fetchForEditRecord().then((res: any)=>{
          if(res){
            this.showSnackBar("data fetch successfully", 3000);
          }
         })
        }
      }
    });
  }
  async fetchForEditRecord() {
    this.isSkeletonLoading = !!this.recordId;
  
    try {
      const res = await this.dataProvider.fetch(this.objectHierarchy, this.recordId, this);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isSkeletonLoading = false;
    }
  }
}

                  `, { name: path.join(layoutPath, tsFile) });
                  // view.module.ts
      archive.append(`
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutActionButtonsModule } from "../../core/components/headerActionButtons/headerActionButtons.module";
import { firebaseProvider } from '../../core/providers/firebaseprovider';
import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from '../../core/config/firebaseConfig';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { dataProvider } from '../../core/providers/dataProvider';
import { ${layoutDirectory} } from './${layoutDirectory}';
                    
  const routes: Routes = [
    { path: '', component: ${layoutDirectory} }
  ];
                    
@NgModule({
  declarations: [${layoutDirectory}],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LayoutActionButtonsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    MatSnackBarModule
  ],
  providers:[firebaseProvider, dataProvider]
})
export class ${layoutDirectory}Module { }
                            `, { name: path.join(layoutPath, moduleFile) });
    } else {
      const layoutDirectory = `${page.layoutName}_${page.layoutType}`;
      const layoutPath = path.join(pagesPath, layoutDirectory);

      // Define file names
      const htmlFile = `${layoutDirectory}.html`;
      const tsFile = `${layoutDirectory}.ts`;
      const moduleFile = `${layoutDirectory}.module.ts`;
      // Create files in memory
      archive.append(`<!-- ${layoutDirectory} HTML Template -->\n`, { name: path.join(layoutPath, htmlFile) });
      archive.append(`
          import { Component, OnInit } from '@angular/core';
          
          @Component({
            selector: '${layoutDirectory}',
            templateUrl: './${htmlFile}',
          })
          export class ${layoutDirectory} implements OnInit {
          
            constructor() { }
          
            ngOnInit(): void {
              // Initialization logic here
            }
          
          }
                  `, { name: path.join(layoutPath, tsFile) });
      archive.append(`
                    import { NgModule } from '@angular/core';
                    import { CommonModule } from '@angular/common';
                    import { RouterModule, Routes } from '@angular/router';
                    import { ${layoutDirectory} } from './${layoutDirectory}';
                    
                    const routes: Routes = [
                      { path: '', component: ${layoutDirectory} }
                    ];
                    
                    @NgModule({
                      declarations: [${layoutDirectory}],
                      imports: [
                        CommonModule,
                        RouterModule.forChild(routes)
                      ]
                    })
                    export class ${layoutDirectory}Module { }
                            `, { name: path.join(layoutPath, moduleFile) });
    }






  });

  // Update app-routing.module.ts
  let appRoutingModuleContent = `
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
`;

  metaJson.pages.forEach(page => {
    appRoutingModuleContent += `  { path: '${page.layoutName}_${page.layoutType}', loadChildren: () => import('./pages/${page.layoutName}_${page.layoutType}/${page.layoutName}_${page.layoutType}.module').then(m => m.${page.layoutName}_${page.layoutType}Module) },\n`;
  });

  appRoutingModuleContent += `
  { path: 'home', loadChildren: () => import('./core/components/home_component/home.component.module').then(m => m.HomeModule) },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
`;

  archive.append(appRoutingModuleContent, { name: appRoutingModulePath });

  // Create app.component.ts with dynamic content
  let appComponentPathContent = `
import { Component, OnInit } from '@angular/core';
import { AppUtility } from './core/utils/appUtility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(public appUtils: AppUtility) {}

  appConfig: any = {
    applicationName: "${metaJson.applicationName}",
    applicationDisplayName: "${metaJson.applicationDisplayName}",
    userMail: "${metaJson.userMail}",
    userName: "${metaJson.userName}",
    assignedMenugroups: []
  }

  ngOnInit(): void {
    this.appUtils.appConfig = this.appConfig;
  }

}
`;

  archive.append(appComponentPathContent, { name: appComponentPath });

  // Create menu configuration service file
  let menuConfigrationContent = `
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class menuConfigration {

  constructor() { }

  menuConfigration = ${JSON.stringify(metaJson.menuConfigration, null, 2)};

}
`;

  archive.append(menuConfigrationContent, { name: menuConfigrationPath });

  let layoutConfigrationContent = `
  import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class LayoutConfiguration {

    constructor() {}

    public layoutConfiguration = ${JSON.parse(JSON.stringify(metaJson.layoutConfiguration, null, 2))};
}`;

archive.append(layoutConfigrationContent, { name: layoutConfigrationPath });


  // Finalize the archive and end the response
  archive.finalize();
});

app.listen(port, '0.0.0.0', () => {
  console.log(`\x1b[32mServer running at http://localhost:${port}/download-project\x1b[0m`); // Green
});
