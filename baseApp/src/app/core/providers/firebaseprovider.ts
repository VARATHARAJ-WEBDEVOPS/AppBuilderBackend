import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { firstValueFrom, map, Observable, of } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class firebaseProvider {
  private dbPath = '/ticRecordOBJECT';

  ticRef: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    this.ticRef = db.list(this.dbPath);
    
  }

  getAll(): AngularFireList<any> {
    return this.ticRef;
  }

  async create(data: any): Promise<any> {

    // Push the data to Firebase
    await this.db.list('/ticRecordOBJECT').push(data);
    return { id: data.id, rev: data.rev }; // Return the ID and rev
  }

  update(recordId: string, localRev: string, updatedRecord: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Fetch the current record
      this.db.list(`/ticRecordOBJECT`).valueChanges().pipe(take(1)).subscribe((records: any[]) => {
        const currentRecord = records.find(item => item.id === recordId);
        console.log('Current Record:', currentRecord); // Debugging Log
  
        if (currentRecord) {
          const currentRev = currentRecord.rev.split('_')[0];
          console.log('Current Revision:', currentRev, 'Local Revision:', localRev.split('_')[0]); // Debugging Log
  
          if (currentRev !== localRev.split('_')[0]) {
            console.error('Conflict detected!'); // Debugging Log
            reject(`Conflict detected in the ${updatedRecord['data']['type']} Object! The record has been updated by another user.`);
          } else {
            // Proceed to update the record
            const newRev = `${parseInt(currentRev) + 1}_${uuidv4()}`;
            updatedRecord.rev = newRev;
            console.log('Updating Record with New Revision:', newRev); // Debugging Log
  
            // Find the snapshot to update the record
            this.db.list('/ticRecordOBJECT').snapshotChanges().pipe(take(1)).subscribe(snapshots => {
              const snapshot = snapshots.find((snap: any) => snap.payload.val().id === recordId);
              console.log('Snapshot Found:', snapshot); // Debugging Log
  
              if (snapshot) {
                this.db.object(`/ticRecordOBJECT/${snapshot.key}`).update(updatedRecord)
                  .then(() => {
                    resolve({ id: updatedRecord.id, rev: updatedRecord.rev });
                  })
                  .catch(err => {
                    console.error('Error saving record:', err);
                    reject(err);
                  });
              } else {
                reject('Record not found');
              }
            });
          }
        } else {
          reject('Record not found');
        }
      });
    });
  }

  listFetch(type: string):any {
    return this.db.list('/ticRecordOBJECT', ref => ref.orderByChild('data/type').equalTo(type)) // Correct path to 'data/type'
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map((c: any) => {
            const data = c.payload.val(); // Accessing the entire data object
            return {
              id: data.id, // Using payload.key to get the unique key for the record
              rev: data.rev, // Accessing the rev directly from the data object
              data: data.data // Accessing the nested data object
            };
          })
        )
      );
  }
  
  // Firebase Service Method to query data by objectName and then filter by type
queryDataWithFilter(path: string, field: string, value: string, type: string): Promise<any[]> {
  return firstValueFrom(
    this.db.list(path, ref => ref.orderByChild(field).equalTo(value)).valueChanges()
  ).then((results: any[]) => {
    // Filter results by the "type" field if the type is provided
    if (type) {
      return results.filter(item => item.data?.type === type);
    }
    return results;
  });
}

queryDataByField(path: string, field: string, value: string): Promise<any[]> {
  return firstValueFrom(this.db.list(path, ref => ref.orderByChild(field).equalTo(value)).valueChanges());
}  

generateIdForPrimaryField(type: string, hierarchy: any): Promise<any> {
  return firstValueFrom(
    this.db.list("ticRecordOBJECT", ref => ref.orderByChild('data/type').equalTo(type)).valueChanges()
  ).then((results: any[]) => {
    // If there are no results, return the prefix with '01'
    if (results.length === 0) {
      return hierarchy.primaryFieldNamePrefix + '01';
    } else {
      // Sort results by timestamp to find the latest record
      const latestRecord = results.sort((a, b) => b.timestamp - a.timestamp)[0];
      const lastNumericId = latestRecord['data'][hierarchy.primaryFieldName];
      
      // Increment the last numeric ID suffix
      const newSuffix = (parseInt(lastNumericId.replace(/^\D+/g, '')) + 1).toString().padStart(2, '0');
      
      return hierarchy.primaryFieldNamePrefix + newSuffix;
    }
  });
}


//   delete(key: string): Promise<void> {
//     return this.ticRef.remove(key);
//   }

//   deleteAll(): Promise<void> {
//     return this.ticRef.remove();
//   }

}