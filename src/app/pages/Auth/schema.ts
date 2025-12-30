import * as Yup from "yup";

export interface AuthFormValues {
  phone: string;
  otp: string;
}

export const schema = Yup.object().shape({
  phone: Yup.string()
    .trim()
    .required("شماره موبایل الزامی است")
    // چک می‌کنیم که حتماً با 9 شروع شود و دقیقاً 10 رقم باشد
    .matches(
      /^9\d{9}$/,
      "شماره موبایل باید با 9 شروع شده و 10 رقم باشد (مثال: 9381234567)",
    ),
  otp: Yup.string().strip(),
});
