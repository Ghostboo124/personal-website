import clsx from "clsx";
import NextLink from "next/link";
import { forwardRef, ComponentProps } from "react";

const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(
  (
    {
      href,
      className,
      prefetch,
      shallow,
      scroll,
      replace,
      target,
      rel,
      ...props
    },
    ref,
  ) => {
    const isExternal =
      typeof href === "string" &&
      (href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//"));

    if (isExternal) {
      // Merge rel values, ensuring noopener noreferrer are always present
      const relParts = rel ? rel.split(/\s+/) : [];
      const requiredRel = ["noopener", "noreferrer"];
      const mergedRelParts = [
        ...relParts.filter((part) => part && !requiredRel.includes(part)),
        ...requiredRel,
      ];
      const mergedRel = mergedRelParts.join(" ");

      return (
        <a
          ref={ref}
          href={href}
          className={clsx("underline", className)}
          target={target ?? "_blank"}
          rel={mergedRel}
          {...props}
        />
      );
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        className={clsx("underline", className)}
        prefetch={prefetch}
        shallow={shallow}
        scroll={scroll}
        replace={replace}
        target={target}
        rel={rel}
        {...props}
      />
    );
  },
);

Link.displayName = "Link";

export default Link;
