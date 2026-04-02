import { ConvertUtil } from "./convert.util";
import { ValidationUtil } from "../../common/util/validation.util";
import { MemberModel } from "src/app/model/member.model";
import { AuthService } from "../../service/auth.service";
import { Inject, Injectable, inject } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import jwt_decode from 'jwt-decode';

export class AuthDetail {
  static _authService: any;
  constructor() {}

  static getLoginedInfo(): MemberModel {
    const jwt = AuthDetail.getCookie("jwt");
    if (ValidationUtil.isNotNullAndNotEmpty(jwt)) {
      try {
        const decoded: any = jwt_decode(jwt + "");
        console.log("[AuthDetail] Decoded JWT:", decoded);
        return {
          jwt: jwt,
          email: decoded.email,
          role: decoded.role || decoded.roles,
          tier: decoded.tier || 'BASIC',
          id: decoded.id || decoded.sub // Use sub as fallback for ID
        } as any as MemberModel;
      } catch (e) {
        return { jwt: jwt } as any as MemberModel;
      }
    }
    return {} as MemberModel;
  }

  static actionLogOut() {
    AuthDetail.setCookie("jwt", "", -1);
    localStorage.removeItem('lastAction');
  }

  static getHeaderJwt(): any {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthDetail.getCookie("jwt")}`
    });
  }

  static isLogin(): boolean {
    const jwt = AuthDetail.getCookie("jwt");
    return jwt !== null && jwt !== undefined && jwt !== "null" && jwt !== "";
  }

  static setCookie(name: string, value: string, days: number) {
    console.log(`[AuthDetail] Setting cookie: ${name}`);
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    const cookieString = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/; SameSite=Lax";
    document.cookie = cookieString;
    console.log("[AuthDetail] Cookie string attempted:", cookieString);
    console.log("[AuthDetail] document.cookie now contains 'jwt'?", document.cookie.includes("jwt"));
  }

  static getCookie(name: string) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) {
        const val = c.substring(nameEQ.length, c.length);
        try {
          return decodeURIComponent(val);
        } catch (e) {
          return val;
        }
      }
    }
    return null;
  }
}