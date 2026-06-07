import "../styles/globals.css";
import { DineFlowProvider } from "./context";

export const metadata = {
  title: "DineFlow",
  description: "Discover restaurants, reserve tables, order food, and run your entire restaurant business—all in one place.",
};

const faviconSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M 55 15 A 35 35 0 1 1 55 85' fill='none' stroke='%23FF6B00' stroke-width='10' stroke-linecap='round'/><circle cx='102' cy='50' r='4' fill='%23FF6B00'/></svg>";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href={`data:image/svg+xml,${faviconSvg}`} />
      </head>
      <body className="bg-page text-body">
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <DineFlowProvider>
          {children}
        </DineFlowProvider>
      </body>
    </html>
  );
}
