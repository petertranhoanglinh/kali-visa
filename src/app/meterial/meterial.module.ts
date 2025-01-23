import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatIconModule,
    MatDialogModule,
  ],

  exports: [
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatIconModule,
    MatDialogModule
  ]

  
})
export class MeterialModule { }
