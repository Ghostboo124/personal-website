import clsx from "clsx";
import NextLink from "next/link";
import { forwardRef, ComponentProps } from "react";

const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(
  ({ href, className, ...props }, ref) => {
    const isExternal =
      typeof href === "string" &&
      (href.startsWith("http://") || href.startsWith("https://"));

    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          className={clsx("underline", className)}
          {...props}
        />
      );
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        className={clsx("underline", className)}
        {...props}
      />
    );
  }
);

Link.displayName = "Link";

export default Link;
