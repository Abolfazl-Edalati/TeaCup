import * as Yup from "yup";

export interface AuthFormValues {
  phone: string;
  otp?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const schema: Yup.ObjectSchema<AuthFormValues> = Yup.object({
  phone: Yup.string()
    .required("شماره موبایل الزامی است")
    .matches(/^9\d{9}$/, "فرمت شماره صحیح نیست"),

  otp: Yup.string().when("$step", {
    is: "OTP",
    then: (s) => s.required("کد تایید الزامی است"),
    otherwise: (s) => s.notRequired(),
  }),

  firstName: Yup.string().when(["$step", "$isRegister"], {
    is: (step: string, isRegister: boolean) => step === "OTP" && isRegister,
    then: (s) => s.required("نام الزامی است"),
    otherwise: (s) => s.notRequired(),
  }),

  lastName: Yup.string().when(["$step", "$isRegister"], {
    is: (step: string, isRegister: boolean) => step === "OTP" && isRegister,
    then: (s) => s.required("نام خانوادگی الزامی است"),
    otherwise: (s) => s.notRequired(),
  }),

  email: Yup.string().when(["$step", "$isRegister"], {
    is: (step: string, isRegister: boolean) => step === "OTP" && isRegister,
    then: (s) => s.email("ایمیل معتبر نیست").required("ایمیل الزامی است"),
    otherwise: (s) => s.notRequired(),
  }),
});
