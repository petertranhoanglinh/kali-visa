import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';
import { ProductState } from 'src/app/selectors/product.selector';

@Component({
  selector: 'app-category-register',
  templateUrl: './register-catelogy.component.html',
  styleUrls: ['./register-catelogy.component.css']
})
export class RegisterCategoryComponent implements OnInit {
  categoryForm: FormGroup = {} as FormGroup;
  submitted = false;
  constructor(private formBuilder: FormBuilder ,
         private toastr: ToastrService ,
        private productStore: Store<ProductState>,
        private overlayLoadingStore: Store<OverlayLoadingState>,
  ) {}

  ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      categoryName: ['', Validators.required],
      description: ['', Validators.required],
      parentCategory: [''],
      status: ['active'],
      imageUrl: [''],
      sortNo: ['', [Validators.required, Validators.min(0)]]
    });
  }
  get f() {
    return this.categoryForm.controls;
  }

  onSubmit() {
    this.submitted = true;


    if (this.categoryForm.valid) {
      console.log(this.categoryForm.value);
    }
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.categoryForm.patchValue({
        imageUrl: file
      });
    }
  }
}
