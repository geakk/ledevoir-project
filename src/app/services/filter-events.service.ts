import { EventEmitter, Injectable } from '@angular/core';
import { RawDataEntry } from '../interfaces/data-entry.interface';

@Injectable({
  providedIn: 'root',
})
export class FilterEventsService {
  dataFilter$ = new EventEmitter<Partial<RawDataEntry>>();
}
