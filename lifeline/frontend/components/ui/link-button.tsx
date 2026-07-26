import Link, { type LinkProps } from "next/link";

import { buttonClasses, type ButtonVariant } from "@/components/ui/button";

type Props = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant;
  };

/** A navigation link styled as a button — never a `<button>` nested in an `<a>`. */
export function LinkButton({ className, variant = "default", ...props }: Props) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
