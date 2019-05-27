import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-error-feedback',
  templateUrl: './error-feedback.component.html',
  styleUrls: ['./error-feedback.component.scss']
})
export class ErrorFeedbackComponent {

  public title: string;
  public message: string;

  constructor(public dialogRef: MatDialogRef<ErrorFeedbackComponent>) { }

  dismiss(): void {
    this.dialogRef.close();
  }
}
