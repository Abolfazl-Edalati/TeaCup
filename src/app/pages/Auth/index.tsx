// Import Dependencies
import { useState } from "react";
import { Link } from "react-router";
import {
  DevicePhoneMobileIcon,
  KeyIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

// Local Imports
import Logo from "@/assets/appLogo.svg?react";
import { Button, Card, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";

// ----------------------------------------------------------------------

export default function SignIn() {
  const { login, errorMessage, isLoading } = useAuthContext();
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      phone: "",
      otp: "",
    },
  });

  const phoneNumber = watch("phone");

  const onSubmit = async (data: AuthFormValues) => {
    if (step === "PHONE") {
      const isPhoneValid = await trigger("phone");
      if (isPhoneValid) {
        // شبیه‌سازی ارسال کد
        setStep("OTP");
      }
    } else {
      await login({
        phone: data.phone,
        otp: data.otp,
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
              <h2 className="dark:text-dark-100 text-2xl font-semibold text-gray-600">
                {step === "PHONE" ? "خوش آمدید" : "تایید شماره"}
              </h2>
              <p className="dark:text-dark-300 text-gray-400">
                {step === "PHONE"
                  ? "لطفاً شماره موبایل خود را وارد کنید"
                  : `کد ارسال شده به ${phoneNumber} را وارد کنید`}
              </p>
            </div>
          </div>
          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                {step === "PHONE" ? (
                  <Input
                    label="شماره موبایل"
                    placeholder="09123456789"
                    prefix={
                      <DevicePhoneMobileIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("phone")}
                    error={errors?.phone?.message}
                  />
                ) : (
                  <Input
                    label="کد تایید"
                    placeholder="کد ۵ رقمی را وارد کنید"
                    type="text"
                    prefix={
                      <KeyIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("otp")}
                    error={errors?.otp?.message}
                  />
                )}
              </div>

              <div className="mt-2">
                <InputErrorMsg
                  when={(errorMessage && errorMessage !== "") as boolean}
                >
                  {errorMessage}
                </InputErrorMsg>
              </div>

              <Button
                type="submit"
                className="mt-5 w-full"
                color="primary"
                loading={isLoading}
              >
                {step === "PHONE" ? "ارسال کد تایید" : "ورود"}
              </Button>

              {step === "OTP" && (
                <button
                  type="button"
                  onClick={() => setStep("PHONE")}
                  className="text-primary-600 mt-4 flex w-full items-center justify-center gap-1 text-xs hover:underline"
                >
                  <ArrowRightIcon className="size-3" />
                  ویرایش شماره موبایل
                </button>
              )}
            </form>
          </Card>
          <div className="dark:text-dark-300 mt-8 flex justify-center text-xs text-gray-400">
            <a href="##">اعلان حریم خصوصی</a>
            <div className="dark:bg-dark-500 mx-2.5 my-0.5 w-px bg-gray-200"></div>
            <a href="##">شرایط سرویس</a>
          </div>
        </div>
      </main>
    </Page>
  );
}
