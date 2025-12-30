import { useState, useEffect } from "react";
import {
  KeyIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button, Card, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";
import Logo from "@/assets/appLogo.svg?react";

export default function SignIn() {
  const { login, initiateAuth, errorMessage, isLoading } = useAuthContext();
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phoneValue, setPhoneValue] = useState<string>("");

  // استیت تایمر و وضعیت نوع درخواست (برای تشخیص ۳ یا ۵ دقیقه)
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRegister, setIsRegister] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    resetField,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
  });

  // مدیریت معکوس تایمر
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // تابع کمکی برای فرمت زمان (00:00)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = (type: "login" | "register") => {
    setTimeLeft(type === "register" ? 300 : 180); // ۵ دقیقه یا ۳ دقیقه
  };

  const handleInitiate = async (phone: string) => {
    try {
      const formattedPhone = phone.startsWith("+98") ? phone : `+98${phone}`;
      const response = await initiateAuth(formattedPhone);

      // فرض بر این است که سرور در پاسخ می‌گوید این کاربر ثبت‌نامی است یا لاگین
      const type = response?.isNewUser ? "register" : "login";
      setIsRegister(response?.isNewUser || false);

      setPhoneValue(formattedPhone);
      setStep("OTP");
      resetField("otp"); // پاک کردن مقدار قبلی اینپوت OTP
      startTimer(type);
    } catch (error) {
      console.error("Error initiating...");
    }
  };

  const onSubmit = async (data: AuthFormValues) => {
    if (step === "PHONE") {
      const isPhoneValid = await trigger("phone");
      if (isPhoneValid) {
        await handleInitiate(data.phone);
      }
    } else {
      const currentValues = getValues();
      await login({
        twoFactorCode: currentValues.otp,
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
                {step === "PHONE" ? "خوش آمدید" : "تایید شماره"}
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
              <div className="space-y-5">
                {step === "PHONE" ? (
                  <Input
                    dir="ltr"
                    label="شماره موبایل"
                    placeholder="9381234567"
                    suffix={
                      <span className="border-s border-gray-500 px-1 text-gray-500">
                        +98
                      </span>
                    }
                    {...register("phone")}
                    error={errors?.phone?.message}
                  />
                ) : (
                  <div className="space-y-3">
                    <Input
                      dir="ltr"
                      label="کد تایید"
                      placeholder="******"
                      className="px-0"
                      prefix={<KeyIcon className="size-5" />}
                      {...register("otp")}
                      error={errors?.otp?.message}
                      autoFocus
                    />
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
                        // اضافه کردن وضعیت isLoading برای جلوگیری از کلیک دوباره
                        disabled={isLoading}
                        onClick={() => handleInitiate(phoneValue)}
                        className={`flex items-center gap-1 font-medium hover:underline ${
                          isLoading
                            ? "cursor-not-allowed text-gray-400"
                            : "text-primary-600"
                        }`}
                      >
                        {isLoading ? (
                          <ArrowPathIcon className="size-4 animate-spin" /> // آیکون در حال چرخش
                        ) : (
                          <ArrowPathIcon className="size-4" />
                        )}
                        {isLoading ? "در حال ارسال..." : "ارسال مجدد کد"}
                      </button>
                    )}
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
                {step === "PHONE" ? "ارسال کد تایید" : "ورود"}
              </Button>

              {step === "OTP" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("PHONE");
                    setTimeLeft(0);
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
