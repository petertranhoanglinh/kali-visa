export interface MemberModel {
    id: string;
    password: string;
    username: string;
    address: string;
    menuCd: string;
    photo: string;
    email: string;
    addr: string;
    phone: string;
    description: string;
    imgOldName: string;
    role: string;
    tier?: string;
    jwt: string;
    loginDate: string;
    logoutDate: string;
}
