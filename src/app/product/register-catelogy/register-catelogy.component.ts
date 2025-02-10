import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { saveCategoryAction } from 'src/app/actions/product.action';
import { ResultModel } from 'src/app/model/result.model';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';
import { getResultSaveCate, ProductState } from 'src/app/selectors/product.selector';

@Component({
  selector: 'app-category-register',
  templateUrl: './register-catelogy.component.html',
  styleUrls: ['./register-catelogy.component.css']
})
export class RegisterCategoryComponent implements OnInit {
  categoryForm: FormGroup = {} as FormGroup;
  submitted = false;
  result$ = new Observable<ResultModel>();
  file:any ;
  constructor(private formBuilder: FormBuilder ,
         private toastr: ToastrService ,
        private productStore: Store<ProductState>,
        private overlayLoadingStore: Store<OverlayLoadingState>,
  ) {

    this.result$ = this.productStore.select(getResultSaveCate)

  }

  ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      categoryName: ['', Validators.required],
      description: ['', Validators.required],
      parentCategory: [''],
      status: ['active'],
      imageUrl: [''],
      sortNo: ['', [Validators.required, Validators.min(0)]]
    });

    this.result$.subscribe( res =>{
      if(Number(res.code) == 200){
        this.toastr.success(String(res.msg))
      }
    })
  }
  get f() {
    return this.categoryForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    
    if (this.categoryForm.valid) {
      console.log(this.categoryForm.value);
    }

    let params = {
      categoryName: this.categoryForm.value.categoryName,
      description: this.categoryForm.value.description,
      parentCategory: this.categoryForm.value.parentCategory,
      status: this.categoryForm.value.status,
      imageUrl: '',
      sortNo: this.categoryForm.value.sortNo
    };

    this.productStore.dispatch(saveCategoryAction({ params: params, img: this.file }));
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    this.file = file;
    if (file) {
      this.categoryForm.patchValue({
        imageUrl: file
      });
    }
  }



}
