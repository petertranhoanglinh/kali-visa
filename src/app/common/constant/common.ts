export class Common {
    static GOOGLE_USER = "google_user"
    static CODE_OK = 200;

    static  checkPremiumStatus = (userInfo: any): boolean => {
        if (!userInfo) return false;
        if (userInfo.role === 'ADMIN') return true;
        const hasValidTier = userInfo.tier === 'PRO' || userInfo.tier === 'PLUS';
        const now = new Date();
        const expiryDate = userInfo.expiryDate ? new Date(userInfo.expiryDate) : null;
        const isNotExpired = expiryDate ? expiryDate > now : false;

        return hasValidTier && isNotExpired;
    };

}