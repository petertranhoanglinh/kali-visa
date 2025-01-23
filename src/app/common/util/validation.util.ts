

export class ValidationUtil {

  static isNotNullAndNotEmpty(value: any): boolean {
    if (value !== undefined && value !== null) {
      if (typeof value === "string") {
        return value.trim().length > 0;
      } else if (value instanceof Array) {
        return value.length > 0;
      }

      return true;
    }

    return false;
  }

  static isNullOrEmpty(value: any): boolean {
    if (value !== undefined && value !== null) {
      if (typeof value === "string") {
        return value.trim().length === 0;
      } else if (value instanceof Array) {
        return value.length === 0;
      }

      return false;
    }

    return true;
  }
}