import { DateFilterModel } from "@app/models/components/date-filter.model";
import { SelectDropdownModel } from "@app/models/components/select-dropdown.model";
import { ConvertUtil } from "./convert.util";
import { ValidationUtil } from "./validation.util";

export class QuickSearchUtil {
  static searchThisMonth(strYear: string, strMonth: string, strDate: string): DateFilterModel {
    const now = new Date();
    // const endDateOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    // const ed = endDateOfMonth.getDate();
    const ed = now.getDate();

    return {
      fromDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown(m, m, strMonth),
        date: this.getQuickSearchSelectDropdown("01", "01", strDate),
      },
      toDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown(m, m, strMonth),
        date: this.getQuickSearchSelectDropdown(ed, ed, strDate),
      }
    }
  }

  static searchLastMonth(strYear: string, strMonth: string, strDate: string): DateFilterModel {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const endDateOfLastMonth = new Date(y, m, 0);
    const ed = endDateOfLastMonth.getDate();

    return {
      fromDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown(m, m, strMonth),
        date: this.getQuickSearchSelectDropdown("01", "01", strDate),
      },
      toDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown(m, m, strMonth),
        date: this.getQuickSearchSelectDropdown(ed, ed, strDate),
      }
    }
  }

  static searchLast3Months(strYear: string, strMonth: string, strDate: string): DateFilterModel {
    const now = new Date();
    const endDateOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dateOfLast3Month = new Date();
    dateOfLast3Month.setMonth(now.getMonth() - 2);

    const l3y = dateOfLast3Month.getFullYear();
    const l3m = dateOfLast3Month.getMonth() + 1;
    const l3d = "01";

    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const ed = now.getDate();
    // const ed = endDateOfMonth.getDate();

    return {
      fromDate: {
        year: this.getQuickSearchSelectDropdown(l3y, l3y, strYear),
        month: this.getQuickSearchSelectDropdown(l3m, l3m, strMonth),
        date: this.getQuickSearchSelectDropdown(l3d, l3d, strDate),
      },
      toDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown(m, m, strMonth),
        date: this.getQuickSearchSelectDropdown(ed, ed, strDate),
      }
    }
  }

  static searchThisYear(strYear: string, strMonth: string, strDate: string): DateFilterModel { 
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    return {
      fromDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown("01", "01", strMonth),
        date: this.getQuickSearchSelectDropdown("01", "01", strDate),
      },
      toDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown(m, m, strMonth),
        date: this.getQuickSearchSelectDropdown(d, d, strDate),
      }
    }
  }

  static searchLastYear(strYear: string, strMonth: string, strDate: string): DateFilterModel { 
    const now = new Date();
    const y = now.getFullYear()-1;

    return {
      fromDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown("01", "01", strMonth),
        date: this.getQuickSearchSelectDropdown("01", "01", strDate),
      },
      toDate: {
        year: this.getQuickSearchSelectDropdown(y, y, strYear),
        month: this.getQuickSearchSelectDropdown("12", "12", strMonth),
        date: this.getQuickSearchSelectDropdown("31", "31", strDate),
      }
    }
  }
  

  static searchAll(yearOptions: SelectDropdownModel[], strYear: string, strMonth: string, strDate: string): DateFilterModel {
    if (ValidationUtil.isNotNullAndNotEmpty(yearOptions)) {
      // const sy = yearOptions[0].value;
      // const ey = yearOptions[yearOptions.length - 1].value;

      // return {
      // fromDate: {
      //   year: this.getQuickSearchSelectDropdown(sy, sy, strYear),
      //   month: this.getQuickSearchSelectDropdown("01", "01", strMonth),
      //   date: this.getQuickSearchSelectDropdown("01", "01", strDate),
      // },
      // toDate: {
      //   year: this.getQuickSearchSelectDropdown(ey, ey, strYear),
      //   month: this.getQuickSearchSelectDropdown("12", "12", strMonth),
      //   date: this.getQuickSearchSelectDropdown("31", "31", strDate),
      // }
      const sy = yearOptions[0].value;
      const today = new Date();

      return {
      fromDate: {
        year: this.getQuickSearchSelectDropdown(sy, sy, strYear),
        month: this.getQuickSearchSelectDropdown("01", "01", strMonth),
        date: this.getQuickSearchSelectDropdown("01", "01", strDate),
      },
      toDate: {
        year: this.getQuickSearchSelectDropdown(today.getFullYear(), today.getFullYear(), strYear),
        month: this.getQuickSearchSelectDropdown(ConvertUtil.convertToZeroDecimal(today.getMonth() + 1), ConvertUtil.convertToZeroDecimal(today.getMonth() + 1), strMonth),
        date: this.getQuickSearchSelectDropdown(ConvertUtil.convertToZeroDecimal(today.getDate()), ConvertUtil.convertToZeroDecimal(today.getDate()), strDate),
      }
    }
    }

    return this.searchThisYear(strYear, strMonth, strDate);
  }

  static getQuickSearchSelectDropdown(value: String | Number, label: String | Number, unit: any): SelectDropdownModel {
    return {
      value: ConvertUtil.convertToSring(ConvertUtil.convertToZeroDecimal(value)),
      label: ConvertUtil.convertToSring(ConvertUtil.convertToZeroDecimal(label)) + ConvertUtil.convertToSring(unit),
    }
  }

  static setTimeToEmpty(): DateFilterModel {
    return {
      fromDate: {
        year: this.getQuickSearchSelectDropdown("", "", ""),
        month: this.getQuickSearchSelectDropdown("", "", ""),
        date: this.getQuickSearchSelectDropdown("", "", "")
      },
      toDate: {
        year: this.getQuickSearchSelectDropdown("", "", ""),
        month: this.getQuickSearchSelectDropdown("", "", ""),
        date: this.getQuickSearchSelectDropdown("", "", "")
      }
    }
  }
}