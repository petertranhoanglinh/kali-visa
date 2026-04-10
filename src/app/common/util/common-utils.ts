import { ConvertUtil } from "./convert.util";

export class CommonUtils {

  static generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static checkPremiumStatus = (userInfo: any): boolean => {
        if (!userInfo) return false;
        if (userInfo.role === 'ADMIN') return true;
        const hasValidTier = userInfo.tier === 'PRO' || userInfo.tier === 'PLUS';
        const now = new Date();
        const expiryDate = userInfo.expiryDate ? new Date(userInfo.expiryDate) : null;
        const isNotExpired = expiryDate ? expiryDate > now : false;

        return hasValidTier && isNotExpired;
    };
    static PYTHON_URL  : string = "http://localhost:8000"

}
