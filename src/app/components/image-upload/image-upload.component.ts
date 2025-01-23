import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {

  @Input()
  imageUrl: string | ArrayBuffer | null | undefined;

  @Input() isShowImg:boolean = true

  @Output() changeFile = new EventEmitter<File>();


  @ViewChild('fileInput') fileInput: any;




  onFileChange(event: any) {
    const file = event.target.files[0];
    this.changeFile.emit(file);
    this.previewImage(file);
  }

  previewImage(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result;
    };
  }

  uploadImage() {
    console.log('Image uploaded:', this.imageUrl);
  }

  clearImage(): void {
    this.imageUrl = null;
    this.fileInput.nativeElement.value = null;
    this.changeFile.emit({} as File);
  }


}
