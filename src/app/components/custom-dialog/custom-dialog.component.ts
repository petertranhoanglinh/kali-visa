// custom-dialog.component.ts
import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResultModel } from 'src/app/model/result.model';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.css']
})
export class CustomDialogComponent {
  @Input()
  isOpen:boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CustomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.isOpen = false;
    this.dialogRef.close();
  }

  getAlertClass(): string {
    if (this.data.code === 200) {
      return 'alert-success'; // Bootstrap class for success messages
    } else {
      return 'alert-danger'; // Bootstrap class for error messages
    }
    //return 'alert-info'; // Default class for informational messages
  }
}
