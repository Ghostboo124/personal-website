import clsx from "clsx";
import NextLink from "next/link";
import { forwardRef, ComponentProps } from "react";

const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(
  (
    { href, className, prefetch, scroll, replace, target, rel, ...props },
    ref,
  ) => {
    // Check if href is external (string or UrlObject)
    const isExternalString =
      typeof href === "string" &&
      (href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//"));

    const isExternalObject =
      typeof href === "object" &&
      href !== null &&
      "pathname" in href &&
      (href.pathname?.startsWith("http://") ||
        href.pathname?.startsWith("https://") ||
        href.pathname?.startsWith("//") ||
        ("host" in href &&
          typeof href.host === "string" &&
          href.host.length > 0 &&
          !href.host.startsWith("/")));

    const isExternal = isExternalString || isExternalObject;

    // Convert href to string for anchor tag when external
    const hrefString: string =
      typeof href === "string"
        ? href
        : isExternalObject &&
            typeof href === "object" &&
            href !== null &&
            "pathname" in href
          ? href.pathname || ""
          : "";

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
          href={hrefString}
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
