export const phoneRule = {
  validator: (rule, value, callback) =>
    !value || /^1[3-9]{1}[0-9]{9}$/.test(value),
  message: '请重新输入正确的手机号码',
}
export const plateNumRule = {
  validator: (rule, value, callback) =>
    !value || /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/.test(value),
  message: '请重新输入正确的车牌号码',
}
export const cardNoRule = {
  validator: (rule, value, callback) =>
    !value || /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|31)|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}([0-9]|x|X)$/.test(value),
  message: '请重新输入正确的身份证号码',
}
export const ipRule = {
  validator: (rule, value, callback) =>
    !value || /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value),
  message: '请重新输入正确的ip',
}
//只能输入数字
export const onlyNumber = {
  validator:  (rule, value, callback) =>
   !value || /^[0-9]*$/g.test(Number(value)),
  message: '只能输入数字',
};
//只能输入数字 不限制小数位数
export const decimal = {
  validator:  (rule, value, callback) =>
   !value || /^[+-]?(0|([1-9]\d*))(\.\d+)?$/.test(Number(value)),
  message: '只能输入数字（含小数）',
};