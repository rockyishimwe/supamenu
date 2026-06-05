import "../styles/globals.css";
import { DineFlowProvider } from "./context";

export const metadata = {
  title: "DineFlow - Premium Restaurant Ecosystem Platform",
  description: "Discover restaurants, reserve tables, order food, and run your entire restaurant business—all in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090e] text-[#f3f4f6]">
        <DineFlowProvider>
          {children}
        </DineFlowProvider>
      </body>
    </html>
  );
}

