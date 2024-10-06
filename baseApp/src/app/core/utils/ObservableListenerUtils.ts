import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObservableListenerUtils {
  private listeners: { [key: string]: Subject<any[]> } = {};

  constructor() {}

  createOrStoreData(name: string, data: any[]) {
    if (!this.listeners[name]) {
      // Create a new listener if it doesn't exist
      this.listeners[name] = new Subject<any[]>();
      console.log(`Listener created: ${name}`);
    } else {
      console.log(`Listener already exists: ${name}`); // Log if listener already exists
    }

    // Emit the data to the listener
    this.listeners[name].next(data);
    console.log(`Data stored in listener: ${name}`, data);
  }
  notifyListeners(name: string, data: any[]) {
    console.log(`Notifying listeners for: ${name}`, data); // Debugging log
    if (this.listeners[name]) {
      this.listeners[name].next(data);
      console.log(`Listeners notified for: ${name}`); // Log after notifying
    } else {
      console.warn(`No listeners found for: ${name}`); // Warn if no listeners
    }
  }
  

  subscribeToListener(name: string, callback: (data: any[]) => void): Subscription {
    this.createOrStoreData(name, []);
    return this.listeners[name]?.subscribe(callback);
  }
}
