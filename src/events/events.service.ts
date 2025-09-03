import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, map } from 'rxjs';
import { ISseData } from './interface/events.interface';

@Injectable()
export class EventsService {
  // observable
  private subject = new Subject<{ event: string; data: ISseData | string }>();

  emit(event: string, data: ISseData | string) {
    this.subject.next({ event, data });
  }

  get events$(): Observable<MessageEvent> {
    return this.subject.asObservable().pipe(
      map(({ event, data }) => ({
        type: event,
        data: typeof data === 'string' ? data : JSON.stringify(data),
      })),
    );
  }
}
