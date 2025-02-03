import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { Injectable } from "@angular/core";
import { ValidationUtil } from "../common/util/validation.util";
import { ResultModel } from "../model/result.model";
import { AuthDetail } from "../common/util/auth-detail";
import { ProductResponseModel, ProductRewiewResponseModel } from "../model/product-response.model";
@Injectable({
  providedIn: 'root'
})
export class ProductService{
    res:string = '';
    constructor(private _http: HttpClient) { }

  allProduct(params:any): Observable<ProductResponseModel> {
    let url = `${environment.apiUrl}/api/products`;
    const headers: HttpHeaders = AuthDetail.getHeaderJwt();
    const page = params.page;
    const len = params.len;
    if(ValidationUtil.isNotNullAndNotEmpty(params.id)){
      url = `${environment.apiUrl}/api/products/` + params.id;
    }
    // Add page and len as query parameters
    const queryParams = `?page=${page}&len=${len}`;
    return this._http.get<ProductResponseModel>(`${url}${queryParams}`);
  }

  getProductRewiew(params:any): Observable<ProductRewiewResponseModel> {
    let url = `${environment.apiUrl}/api/products/getRewiews`;
    const headers: HttpHeaders = AuthDetail.getHeaderJwt();
    const page = params.page;
    const len = params.len;
    const productid = params.productid;
    // Add page and len as query parameters
    const queryParams = `?page=${page}&len=${len}&productid=${productid}`;
    return this._http.get<ProductRewiewResponseModel>(`${url}${queryParams}`, {
        headers: headers
    });
  }

  saveProductRewiew(params:any , file:any):Observable<ResultModel>{
    let url = `${environment.apiUrl}/api/products/saveRewiew`;

    const formData = new FormData();
    if (file) {
      formData.append('fileData', file);
    }
    formData.append('productRewiew', new Blob([JSON.stringify(params)], { type: 'application/json' }));
    const headers: HttpHeaders = new HttpHeaders({
      'Authorization': `Bearer ${AuthDetail.getLoginedInfo()?.jwt}`
    });
    return this._http.post<ResultModel>(url, formData, {
      headers: headers,
    });
  }

  saveProduct(params: any, img: any, sliders: any[]): Observable<ResultModel> {
    let url = `${environment.apiUrl}/api/products/saveProduct`;
    const formData = new FormData();
    if (img) {
      formData.append('img', img);
    }
    if (sliders && sliders.length > 0) {
      sliders.forEach((slider, index) => {
        formData.append('sliders', slider);
      });
    }
    formData.append('productRequest', new Blob([JSON.stringify(params)], { type: 'application/json' }));
    const headers: HttpHeaders = new HttpHeaders({
      'Authorization': `Bearer ${AuthDetail.getLoginedInfo()?.jwt}`
    });
    return this._http.post<ResultModel>(url, formData, {
      headers: headers,
    });
  }


  saveCategory(params:any , file:any):Observable<ResultModel>{
    let url = `${environment.apiUrl}/api/products/saveRewiew`;

    const formData = new FormData();
    if (file) {
      formData.append('fileData', file);
    }
    formData.append('category', new Blob([JSON.stringify(params)], { type: 'application/json' }));
    const headers: HttpHeaders = new HttpHeaders({
      'Authorization': `Bearer ${AuthDetail.getLoginedInfo()?.jwt}`
    });
    return this._http.post<ResultModel>(url, formData, {
      headers: headers,
    });
  }
}




