import * as Yup from "yup";

export interface AuthFormValues {
  phone: string;
  otp: string;
}

export const schema = Yup.object().shape({
  phone: Yup.string()
    .trim()
    .required("شماره موبایل الزامی است")
    .matches(/^09\d{9}$/, "فرمت شماره موبایل اشتباه است"),
  otp: Yup.string().strip(), // در مرحله اول اعتبارسنجی OTP را نادیده می‌گیرد
});
