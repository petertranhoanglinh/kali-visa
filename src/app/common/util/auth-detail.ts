import { ConvertUtil } from "./convert.util";
import { ValidationUtil } from "../../common/util/validation.util";
import { MemberModel } from "src/app/model/member.model";
import { AuthService } from "../../service/auth.service";
import { Inject, Injectable, inject } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";

export class AuthDetail{
  static _authService: any;
  constructor(){
  }
    static getLoginedInfo(): MemberModel {
        let str = localStorage.getItem("member");
        if (ValidationUtil.isNotNullAndNotEmpty(str)) {
          return JSON.parse(str + "");
        }
        return {} as MemberModel;
    }

    static actionLogOut(){
      localStorage.removeItem('member');
      localStorage.removeItem('lastAction');
      setTimeout(()=>{
        console.log("Your Session Expired due to longer Inactivity, Login Again To Continue");
      },10000);
      
    }

    static getHeaderJwt():any{
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthDetail.getLoginedInfo()?.jwt}`
      });
    }

    static isLogin():boolean{
      if(ValidationUtil.isNotNullAndNotEmpty(AuthDetail.getLoginedInfo()?.jwt)){
        return true;
      }
      return false;
    }

   

    
}