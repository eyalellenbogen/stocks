import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorFeedbackComponent } from './error-feedback/error-feedback.component';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private dialog: MatDialog) { }

  public showError(title: string, message: string) {
    const dialogRef = this.dialog.open(ErrorFeedbackComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
  }
}
