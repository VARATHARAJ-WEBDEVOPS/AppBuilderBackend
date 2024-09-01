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

// Endpoint to receive JSON configuration and create project
app.post('/download-project', (req, res) => {
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

    // Create layout directories and files in memory
    metaJson.pages.forEach(page => {
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

  constructor(private appUtils: AppUtility) {}

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

    // Finalize the archive and end the response
    archive.finalize();
});

app.listen(port, () => {
    console.log(`\x1b[32mServer running at http://localhost:${port}/download-project\x1b[0m`); // Green
});
