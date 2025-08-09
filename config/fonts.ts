import { Fira_Code as FontMono, Inter as FontSans, Protest_Revolution } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const protestRevolution = Protest_Revolution({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-protest-revolution",
});
