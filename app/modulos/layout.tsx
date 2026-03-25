import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";

export default function ModulosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-container px-4 py-6">{children}</main>
      <Footer />
    </>
  );
}
