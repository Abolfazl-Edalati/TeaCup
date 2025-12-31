// Import Dependencies
import { Switch } from "@headlessui/react";
import type { SwitchProps } from "@headlessui/react";
import clsx from "clsx";
import { CSSProperties } from "react";

// Local Imports
import { Spinner } from "@/components/ui";

// ----------------------------------------------------------------------

interface StyledSwitchProps
  extends Omit<SwitchProps<"button">, "className" | "style"> {
  loading?: boolean;
  srText?: string;
  thumbBorder?: string;
  style?: CSSProperties;
  size?: number;
  className?: string;
  classNames?: {
    switch?: string;
    thumb?: string;
    spinner?: string;
  };
  disabled?: boolean;
}

export const StyledSwitch = ({
  loading,
  srText,
  thumbBorder = "2px",
  style,
  size = 5,
  className,
  classNames,
  disabled,
  ...rest
}: StyledSwitchProps) => {
  return (
    <Switch
      className={({ checked }: { checked: boolean }) =>
        clsx(
          `styled-switch relative flex shrink-0 cursor-pointer items-center rounded-full p-(--thumb-border) outline-hidden transition-colors duration-200 ease-in-out focus:outline-hidden`,
          disabled
            ? "bg-gray-150 dark:bg-dark-450 dark:ring-dark-450 pointer-events-none opacity-70 ring-1 ring-gray-200 select-none dark:opacity-60"
            : checked
              ? "this:primary bg-this dark:bg-this-light"
              : "dark:bg-surface-1 bg-gray-300",
          className,
          classNames?.switch,
        )
      }
      style={
        {
          "--thumb-border": thumbBorder,
          width: `${size / 2}rem`,
          height: `${size / 4}rem`,
          ...style,
        } as CSSProperties
      }
      disabled={loading || disabled}
      {...rest}
    >
      {({ checked }: { checked: boolean }) => (
        <>
          <span className="sr-only">{srText}</span>
          <span
            aria-hidden="true"
            className={clsx(
              "styled-switch-thumb pointer-events-none flex h-full w-[calc(100%/2-var(--thumb-border))] transform items-center justify-center rounded-full p-0.5 shadow-lg ring-0 transition duration-200 ease-in-out",
              checked
                ? "translate-x-[calc(100%+var(--thumb-border)*2)] rtl:-translate-x-[calc(100%+var(--thumb-border)*2)]"
                : "dark:bg-dark-50 translate-x-0 bg-white",
              disabled
                ? "dark:bg-dark-800 bg-gray-400"
                : checked
                  ? "bg-white"
                  : "dark:bg-dark-50 bg-white",
              classNames?.thumb,
            )}
          >
            {loading && (
              <Spinner
                isElastic
                color={checked ? "primary" : "neutral"}
                className={clsx("h-full w-full border-2", classNames?.spinner)}
              />
            )}
          </span>
        </>
      )}
    </Switch>
  );
};
