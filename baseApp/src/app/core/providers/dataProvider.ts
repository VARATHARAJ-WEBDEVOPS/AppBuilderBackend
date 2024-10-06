import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { firebaseProvider } from './firebaseprovider';
import { getDatabase, ref, query, orderByChild, equalTo, get } from "firebase/database";
import { forEach, uniqBy } from 'lodash';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class dataProvider {

  constructor(private firebaseProvider: firebaseProvider) { }

  handleSave(
    saveData: any[],
    objectHierarchy: any,
    parentRecordID: string,
    parentContext: any
  ): Promise<{ id: string; rev: string }> {
    // Get the rootPath dynamically and retrieve corresponding section data
    let rootPath = objectHierarchy.rootPath;
    let currentData = saveData.find((section) => section[rootPath]);

    if (currentData) {
      // Handle 1:N case where there are multiple entries
      if (Array.isArray(currentData[rootPath])) {
        const savePromises = currentData[rootPath].map((data: any) =>
          this.processSave(
            data,
            objectHierarchy,
            saveData,
            parentRecordID,
            rootPath,
            parentContext
          )
        );
        // Wait for all promises to resolve
        return Promise.all(savePromises).then((results) => {
          // Return the result of the primary object save
          return results[0];
        });
      } else {
        // Single object save
        return this.processSave(
          currentData[rootPath],
          objectHierarchy,
          saveData,
          parentRecordID,
          rootPath,
          parentContext
        );
      }
    }

    // Default empty result if no data found
    return Promise.resolve({ id: '', rev: '' });
  }

  processSave(
    data: any,
    objectHierarchy: any,
    saveData: any[],
    parentRecordID: string,
    rootPath: string,
    parentContext: any
  ): Promise<{ id: string; rev: string }> {
    // Update parent field if needed
    if (objectHierarchy.objectType !== "primary" && objectHierarchy?.parentObject) {
      data[objectHierarchy?.parentObject] = parentRecordID;
    }

    // Save to database and handle the response ID
    return this.saveToDB(data, rootPath, parentContext).then((savedID: string) => {
      console.log(`Saved ${objectHierarchy.objectName} with ID: ${savedID}`);

      // Recursively handle child objects after saving the current object
      if (
        objectHierarchy &&
        objectHierarchy.childObject &&
        objectHierarchy.childObject.length > 0
      ) {
        const childSavePromises = objectHierarchy.childObject.map((child: any) =>
          this.handleSave(saveData, child, savedID, parentContext)
        );
        return Promise.all(childSavePromises).then(() => {
          // After all child objects are saved, return the primary object's ID and rev
          return {
            id: savedID,
            rev: data['rev'], // Ensure the rev field is returned correctly
          };
        });
      }

      // If no children, just return the ID and rev of the current object
      return {
        id: savedID,
        rev: data['rev'], // Return the rev field here
      };
    });
  }

  async saveToDB(data: any, rootPath: string, parentContext: any): Promise<string> {
    let recId = parentContext['dataObject'][rootPath]['id'];
    let recRev = parentContext['dataObject'][rootPath]['rev'];
    let saveMode: "update" | "add" = recId ? "update" : "add";
    let currentHierarchy = this.findHierarchyByRootPath(parentContext.objectHierarchy, rootPath);
  
    try {
      // Await the generated ID instead of subscribing
      const id = await this.firebaseProvider.generateIdForPrimaryField(data.type, currentHierarchy);

      if (saveMode === "add") {
        data[currentHierarchy['primaryFieldName']] = id;
        let formattedData = {
          data: data,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          id: data.type + '_2_' + uuidv4(),
          rev: '0_' + uuidv4()
        };
  
        console.log('Saving new record to DB:', formattedData); // Debugging Log
        const res = await this.firebaseProvider.create(formattedData);
        parentContext['dataObject'][rootPath]['id'] = res.id;
        parentContext['dataObject'][rootPath]['rev'] = res.rev;
        return res.id;
      } else {
        let formattedData = { data, id: recId, rev: recRev };
        console.log('Updating existing record in DB:', formattedData); // Debugging Log
  
        if (parentContext['dirtyStatus'][rootPath]) {
          const res = await this.firebaseProvider.update(recId, recRev, formattedData);
          parentContext['dataObject'][rootPath]['id'] = res.id;
          parentContext['dataObject'][rootPath]['rev'] = res.rev;
          return res.id;
        } else {
          return recId; // No update needed
        }
      }
    } catch (error) {
      console.error('Error during ID generation or DB operation:', error);
      throw error; // Propagate the error
    }
  }
  

  async fetch(children: any[], parentRecordId: string, parentContext: any) {
    for (const child of children) {
      let childData: any;

      // Handle primary object type
      if (child.objectType === 'primary') {
        // Fetch the primary object data using parentRecordId
        const result = await this.firebaseProvider.queryDataWithFilter(
          'ticRecordOBJECT',   // Path
          'id',                // Field to query by (using 'id' instead of 'objectName')
          parentRecordId,     // Use the parentRecordId to fetch the primary object
          child.objectName     // Additional filter condition (e.g., 'primary')
        );

        if (result && result.length > 0) {
          childData = result[0];  // We expect only one record
          parentContext.dataObject[child.rootPath] = {
            ...childData.data,
            id: childData.id,
            rev: childData.rev
          };
        }
      }

      // Handle one-to-one relationships
      if (child.objectType === 'ONETOONE') {
        const result = await this.firebaseProvider.queryDataWithFilter(
          'ticRecordOBJECT',  // Path
          "data/" + child.parentObject,    // Field to query by (e.g., 'employee')
          parentRecordId,     // Value to match
          child.objectName    // Additional filter condition (e.g., 'employeeAddInfo')
        );

        if (result && result.length > 0) {
          childData = result[0];  // One-to-one means we expect only one record
          parentContext.dataObject[child.rootPath] = {
            ...childData.data,
            id: childData.id,
            rev: childData.rev
          };
        }
      }

      // Handle one-to-many relationships
      if (child.objectType === 'ONETOMANY') {
        const result = await this.firebaseProvider.queryDataByField(
          'ticRecordOBJECT',  // Path
          "data/" + child.parentKey,    // Field to query by (e.g., 'employee')
          parentRecordId      // Value to match
        );

        if (result && result.length > 0) {
          parentContext.dataObject[child.rootPath] = [];

          result.forEach((item: any) => {
            parentContext.dataObject[child.rootPath].push({
              ...item.data,
              id: item.id,
              rev: item.rev
            });
          });
        }
      }

      // Recursive call for child objects (if applicable)
      if (child.childObject && child.childObject.length > 0) {
        await this.fetch(child.childObject, childData?.id, parentContext);
      }
    }
  }

  async listFetch(searchQuery: string, objectHierarchy: any, parentFetchedRecord: any[]): Promise<any[]> {
    const db = getDatabase(); // Initialize Firebase Database
    let finalFetchedRecord: any[] = parentFetchedRecord; // Initialize the final fetched record
  
    for (const childObject of objectHierarchy) {
      let fetchedRecord: any[] = finalFetchedRecord; // Use the final fetched record
  
      if (childObject.objectType === 'primary') {
        const q = query(
          ref(db, 'ticRecordOBJECT'),
          orderByChild('data/type'),
          equalTo(searchQuery)
        );
  
        // Execute the query
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const result = snapshot.val();
          if (result && Object.keys(result).length > 0) {
            Object.keys(result).forEach((key: string) => {
              const eachRecord: any = {
                [childObject['objectName']]: {
                  ...result[key]['data'],
                  id: result[key]['id'],
                  rev: result[key]['rev'],
                },
              };
              fetchedRecord.push(eachRecord);
            });
          }
        }
      }
  
      // Handle one-to-one relationships
      if (childObject.objectType === 'ONETOONE') {
        const fetchPromises = fetchedRecord.map(async (record: any) => {
          const result = await this.firebaseProvider.queryDataWithFilter(
            'ticRecordOBJECT',
            "data/" + childObject.parentObject,
            record[childObject.parentObject]?.['id'],
            childObject.objectName
          );
  
          if (result && result[0]) {
            const data = result[0]['data'];
            // Update fetchedRecord with the retrieved data
            record[childObject.objectName] = {
              ...data,
              id: result[0]['id'],
              rev: result[0]['rev'],
            };
          }
        });
  
        // Wait for all promises to resolve
        await Promise.all(fetchPromises);
      }
  
      // Recursive call for child objects
      if (childObject.childObject && childObject.childObject.length > 0) {
        const childFetchedRecords = await this.listFetch("", childObject.childObject, fetchedRecord);
        finalFetchedRecord = finalFetchedRecord.concat(childFetchedRecords); // Combine child records
      }
    }
    
    // Ensure uniqueness in finalFetchedRecord (based on 'id' or deep comparison)
    finalFetchedRecord = uniqBy(finalFetchedRecord, (record) => {
      const firstKey = Object.keys(record)[0];
      return record[firstKey]?.id; // Assuming each record has an 'id' field
    });
  
    return finalFetchedRecord;  // Return the final fetched records
  }

  findHierarchyByRootPath(hierarchyArray, rootPath) {
    for (let hierarchy of hierarchyArray) {
      // Check if the current hierarchy matches the rootPath
      if (hierarchy.rootPath === rootPath) {
        return hierarchy;
      }
      
      // If there are child objects, perform recursion
      if (hierarchy.childObject && hierarchy.childObject.length > 0) {
        const foundChild = this.findHierarchyByRootPath(hierarchy.childObject, rootPath);
        if (foundChild) {
          return foundChild; // Return found hierarchy from child
        }
      }
    }
    return null; // Return null if no match is found
  }
  
}
