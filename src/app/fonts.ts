import { Plus_Jakarta_Sans } from "next/font/google";

// Font sa punom podrškom za č ć š ž đ (latin-ext)
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});
