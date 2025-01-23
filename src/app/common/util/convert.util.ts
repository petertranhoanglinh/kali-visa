
import { of } from "rxjs";

import { ValidationUtil } from "./validation.util";

export class ConvertUtil {

  static convertToZeroDecimal(value: String | Number): string {
    if (ValidationUtil.isNullOrEmpty(value)) return "";

    let _number = +value;

    if (_number < 10) return "0" + _number;

    return _number.toString();
  }

  static convertToSring(value: any): string {
    if (ValidationUtil.isNotNullAndNotEmpty(value)) {
      if (typeof value === "string") {
        return value;
      } else {
        return value.toString();
      }
    }

    return "";
  }

  static setComma(value: String | Number): string {
    if (ValidationUtil.isNotNullAndNotEmpty(value)) {
      if (typeof value !== "string") {
        value = value.toString();
      } 

      let result = value + "";
      let regex = /(^[+-]?\d+)(\d{3})/;
      while (regex.test(result)) {
        result = result.replace(regex, '$1' + ',' + '$2');
      }

      return result;
    }

    return "0";
  }

  static convertToIntValue (_string: string) {
    return parseInt(_string.replace(/,/g, ''), 10);
  }


  


  // 구분자(HAN / US / KR / JP)
  // 구분(S 짧게 / L 길게)
  // 날짜(YYYYMMDD)

  // 사 용 예 제 :  SELECT ufDate('HAN', 'S', '20200502') FROM DUAL; -> 2020년5월2일
  //               SELECT ufDate('US',  'S', '20200520') FROM DUAL; -> 5.2.2020    
  //               SELECT ufDate('KR',  'L', '20200502') FROM DUAL; -> 2020-05-02  
  //               SELECT ufDate('US',  'L', '20200502') FROM DUAL; -> 2020.05.02  
  //               SELECT ufDate('HAN', 'S', '202005'  ) FROM DUAL; -> 2020년5월   
  //               SELECT ufDate('US',  'S', '202005'  ) FROM DUAL; -> 5.2020      
  //               SELECT ufDate('KR',  'L', '202005'  ) FROM DUAL; -> 2020-05     
  //               SELECT ufDate('US',  'L', '202005'  ) FROM DUAL; -> 2020.05  
  
  static ufDate(seperate : String, kind : String, stringDate : String, sign : string) {

    if (ValidationUtil.isNullOrEmpty(seperate))    return "";
    if (ValidationUtil.isNullOrEmpty(kind))        return "";
    if (ValidationUtil.isNullOrEmpty(stringDate))  return "";
    let date = "";
    let signDate = ConvertUtil.getSignDate(seperate, sign);

    let lengthDate = stringDate.trim().length;

    if(kind == 'S') {
      if(lengthDate == 8) {
        if(seperate == 'HAN') {
          date = stringDate.substring(0,4) + '년' + Number(stringDate.substring(4,6)).toString + '월' + Number(stringDate.substring(6,8)).toString;
        }else if(seperate == 'KR') {
          date = stringDate.substring(0,4) + signDate + Number(stringDate.substring(4,6)).toString + signDate + Number(stringDate.substring(6,8)).toString;
        }else if(seperate == 'US') {
          date = stringDate.substring(4,6) + signDate + Number(stringDate.substring(6,8)).toString + signDate + Number(stringDate.substring(0,4)).toString;
        }else if(seperate == 'JP') {
          date = stringDate.substring(0,4) + signDate + Number(stringDate.substring(4,6)).toString + signDate + Number(stringDate.substring(6,8)).toString;
        }else if(seperate == 'VN') {
          date = stringDate.substring(6,8) + signDate + Number(stringDate.substring(4,6)).toString + signDate + Number(stringDate.substring(0,4)).toString;
        }else if(seperate == 'TH') {
          date = stringDate.substring(4,6) + signDate + Number(stringDate.substring(6,8)).toString + signDate + Number(stringDate.substring(0,4)).toString;
        }
      } else if(lengthDate == 6) {
        if(seperate == 'HAN') {
          date = stringDate.substring(0,4) + '년' + Number(stringDate.substring(4,6)).toString + '월'
        }else if(seperate == 'KR') {
          date = stringDate.substring(0,4) + signDate + Number(stringDate.substring(4,6)).toString;
        }else if(seperate == 'US') {
          date = stringDate.substring(4,6) + signDate + Number(stringDate.substring(0,4)).toString;
        }else if(seperate == 'JP') {
          date = stringDate.substring(0,4) + signDate + Number(stringDate.substring(4,6)).toString;
        }else if(seperate == 'VN') {
          date = stringDate.substring(4,6) + signDate + Number(stringDate.substring(0,4)).toString;
        }else if(seperate == 'TH') {
          date = stringDate.substring(4,6) + signDate + Number(stringDate.substring(0,4)).toString;
        }
      }

      return date;

    } else if (kind == 'L') {
      if(lengthDate == 8) {
        if(seperate == 'HAN') {
          date = stringDate.substring(0,4) + '년' + stringDate.substring(4,6) + '월' + stringDate.substring(6,8);
        }else if(seperate == 'KR') {
          date = stringDate.substring(0,4) + signDate + stringDate.substring(4,6) + signDate + stringDate.substring(6,8);
        }else if(seperate == 'US') {
          date = stringDate.substring(4,6) + signDate + stringDate.substring(6,8) + signDate + stringDate.substring(0,4);
        }else if(seperate == 'JP') {
          date = stringDate.substring(0,4) + signDate + stringDate.substring(4,6) + signDate + stringDate.substring(6,8);
        }else if(seperate == 'VN') {
          date = stringDate.substring(6,8) + signDate + stringDate.substring(4,6) + signDate + stringDate.substring(0,4);
        }else if(seperate == 'TH') {
          date = stringDate.substring(4,6) + signDate + stringDate.substring(6,8) + signDate + stringDate.substring(0,4);
        }
      } else if(lengthDate == 6) {
        if(seperate == 'HAN') {
          date = stringDate.substring(0,4) + '년' + stringDate.substring(4,6) + '월'
        }else if(seperate == 'KR') {
          date = stringDate.substring(0,4) + signDate + stringDate.substring(4,6);
        }else if(seperate == 'US') {
          date = stringDate.substring(4,6) + signDate + stringDate.substring(0,4);
        }else if(seperate == 'JP') {
          date = stringDate.substring(0,4) + signDate + stringDate.substring(4,6);
        }else if(seperate == 'VN') {
          date = stringDate.substring(4,6) + signDate + stringDate.substring(0,4);
        }else if(seperate == 'TH') {
          date = stringDate.substring(4,6) + signDate + stringDate.substring(0,4);
        }
      }

      return date;
    }
    return "";
  }

  static getSignDate(seperate : String, sign : string) {
    let signDate = ""
    if(seperate == 'KR') {
      signDate = ValidationUtil.isNotNullAndNotEmpty(sign) ? sign : '-';
    } else if(seperate == 'US') {
      signDate = ValidationUtil.isNotNullAndNotEmpty(sign) ? sign : '.';
    }else if(seperate == 'JP') {
      signDate = ValidationUtil.isNotNullAndNotEmpty(sign) ? sign : '/';
    }else if(seperate == 'VN') {
      signDate = ValidationUtil.isNotNullAndNotEmpty(sign) ? sign : '/';
    }else if(seperate == 'TH') {
      signDate = ValidationUtil.isNotNullAndNotEmpty(sign) ? sign : '/';
    }

    return signDate;
  }

}