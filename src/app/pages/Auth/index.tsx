import { useState, useEffect } from "react";
import {
  KeyIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button, Card, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";
import Logo from "@/assets/appLogo.svg?react";

export default function SignIn() {
  const {
    login,
    initiateAuth,
    register: registerUser,
    errorMessage,
    isLoading,
  } = useAuthContext();
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phoneValue, setPhoneValue] = useState<string>("");

  // استیت تایمر و وضعیت نوع درخواست
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRegister, setIsRegister] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    resetField,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
    context: { step, isRegister },
    defaultValues: {
      phone: "",
      otp: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // مدیریت معکوس تایمر
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInitiate = async (phone: string) => {
    try {
      const formattedPhone = phone.startsWith("+98") ? phone : `+98${phone}`;
      const response = (await initiateAuth(formattedPhone)) as any;

      console.log("Server Response:", response);

      // تشخیص کاربر جدید بر اساس پاسخ سرور شما
      const isNew =
        response?.type === "REGISTER_INITIATED" || response?.isNewUser === true;

      setIsRegister(isNew);
      setPhoneValue(formattedPhone);
      setStep("OTP");

      // پاک کردن فیلدها برای شروع تازه در مرحله OTP
      resetField("otp");
      resetField("firstName");
      resetField("lastName");
      resetField("email");

      // تنظیم تایمر (5 دقیقه برای ثبت‌نام، 3 دقیقه برای ورود)
      setTimeLeft(isNew ? 300 : 180);
    } catch (error) {
      console.error("Initiate Error", error);
    }
  };

  const onSubmit = async (data: AuthFormValues) => {
    if (step === "PHONE") {
      const isPhoneValid = await trigger("phone");
      if (isPhoneValid) {
        await handleInitiate(data.phone);
      }
      return;
    }

    if (!data.otp) return;

    const code = data.otp;

    if (isRegister) {
      await registerUser({
        twoFactorCode: code,
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? "",
      });
    } else {
      await login({
        twoFactorCode: code,
        rememberMe: true,
      });
    }
  };

  return (
    <Page title="ورود">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          <div className="text-center">
            <Logo className="mx-auto size-16" />
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600">
                {step === "PHONE"
                  ? "خوش آمدید"
                  : isRegister
                    ? "تکمیل ثبت‌نام"
                    : "تایید شماره"}
              </h2>
              <p className="mt-1 text-gray-400">
                {step === "PHONE"
                  ? "لطفاً شماره موبایل خود را وارد کنید"
                  : `کد تایید به شماره ${phoneValue} ارسال شد`}
              </p>
            </div>
          </div>

          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                {step === "PHONE" ? (
                  <Input
                    dir="ltr"
                    label="شماره موبایل"
                    placeholder="9381234567"
                    suffix={
                      <span className="border-s border-gray-500 px-2 text-gray-500">
                        +98
                      </span>
                    }
                    {...register("phone")}
                    error={errors?.phone?.message}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* فیلدهای مخصوص ثبت‌نام (فقط وقتی isRegister مثبت است) */}
                    {isRegister && (
                      <div className="animate-in fade-in slide-in-from-top-2 space-y-4 duration-500">
                        <Input
                          label="نام"
                          placeholder="نام"
                          prefix={<UserIcon className="size-5" />}
                          {...register("firstName")}
                          error={errors?.firstName?.message}
                        />
                        <Input
                          label="نام خانوادگی"
                          placeholder="نام خانوادگی"
                          prefix={<UserIcon className="size-5" />}
                          {...register("lastName")}
                          error={errors?.lastName?.message}
                        />
                        <Input
                          dir="ltr"
                          label="ایمیل"
                          placeholder="example@example.com"
                          prefix={<EnvelopeIcon className="size-5" />}
                          {...register("email")}
                          error={errors?.email?.message}
                        />
                      </div>
                    )}

                    <Input
                      dir="ltr"
                      label="کد تایید"
                      placeholder="******"
                      prefix={<KeyIcon className="size-5" />}
                      {...register("otp")}
                      error={errors?.otp?.message}
                      autoFocus
                    />

                    <div className="flex items-center justify-between px-1 text-sm">
                      {timeLeft > 0 ? (
                        <span className="flex items-center gap-1 text-gray-500">
                          زمان باقی‌مانده:
                          <span className="text-primary-600 font-mono font-bold">
                            {formatTime(timeLeft)}
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleInitiate(phoneValue)}
                          className={`flex items-center gap-1 font-medium hover:underline ${
                            isLoading
                              ? "cursor-not-allowed text-gray-400"
                              : "text-primary-600"
                          }`}
                        >
                          {isLoading ? (
                            <ArrowPathIcon className="size-4 animate-spin" />
                          ) : (
                            <ArrowPathIcon className="size-4" />
                          )}
                          {isLoading ? "در حال ارسال..." : "ارسال مجدد کد"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <InputErrorMsg when={!!errorMessage} className="mt-3">
                {errorMessage}
              </InputErrorMsg>

              <Button
                type="submit"
                className="mt-5 w-full"
                color="primary"
                loading={isLoading}
                disabled={step === "OTP" && timeLeft === 0 && !isLoading}
              >
                {step === "PHONE"
                  ? "ارسال کد تایید"
                  : isRegister
                    ? "ثبت‌نام و ورود"
                    : "ورود"}
              </Button>

              {step === "OTP" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("PHONE");
                    setTimeLeft(0);
                    setIsRegister(false);
                  }}
                  className="hover:text-primary-600 mt-6 flex w-full items-center justify-center gap-1 text-xs text-gray-500"
                >
                  <ArrowRightIcon className="size-3" />
                  تغییر شماره موبایل
                </button>
              )}
            </form>
          </Card>
        </div>
      </main>
    </Page>
  );
}
