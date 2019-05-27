import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-help-feedback',
  templateUrl: './help-feedback.component.html',
  styleUrls: ['./help-feedback.component.scss']
})
export class HelpFeedbackComponent {
  constructor(public dialogRef: MatDialogRef<HelpFeedbackComponent>) { }

  dismiss(): void {
    this.dialogRef.close();
  }
}
