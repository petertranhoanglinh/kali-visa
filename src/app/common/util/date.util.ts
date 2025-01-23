import { ConvertUtil } from "./convert.util";

export class DateUtils {
  static getCurrentDate(withName:boolean, kind:string = ''){
    var now: Date = new Date();
    let y = now.getFullYear();
    let m = ('0' + (now.getMonth()+1)).slice(-2);
    let d = ('0' + (now.getDate())).slice(-2);

    if(kind == 'y'){
      return withName?`${y}년`:`${y}`
    }else if(kind == 'm'){
      return withName?`${m}월`:`${m}`
    }else if(kind == 'd'){
      return withName?`${d}일`:`${d}`
    }
    return withName?`${y}년 ${m}월 ${d}일`:`${y}${m}${d}`
  }

  static getCurrFullDateTimeStr(){
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = ('0' + (today.getMonth()+1)).slice(-2);
    let dd = ('0' + (today.getDate())).slice(-2);

    let hh = today.getHours()
    let min = ('0' + (today.getMinutes())).slice(-2);
    let ss = ('0' + (today.getSeconds())).slice(-2);

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
  }

  static getCurrFullDateTimeStrBlank(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);

    let hh = date.getHours();
    let h = '';

    h = '0' + '' + hh;

    const min = ('0' + date.getMinutes()).slice(-2);
    const ss = ('0' + date.getSeconds()).slice(-2);

    if (Number(hh) < 10) {
        return `${yyyy}${mm}${dd}${h}${min}${ss}`;
    } else {
        return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
    }
   }


  static getDateGlobal(date: Date, lang: string): string {
    if (lang.toUpperCase() === "KR") {
      return date.getFullYear() + "-" + ConvertUtil.convertToZeroDecimal(date.getMonth() + 1) + "-" + ConvertUtil.convertToZeroDecimal(date.getDate());
    }
    return "";
  }
}
