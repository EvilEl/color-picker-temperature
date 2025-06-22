class UniqName {
  public static getUniqName(radix = 36, start = 2, end = 15): string {
    return (
      Math.random().toString(radix).substring(start, end) +
      Math.random().toString(radix).substring(start, end)
    );
  }
}

export default UniqName;
