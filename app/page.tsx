import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import ModuleCard from "@/components/hub/ModuleCard";
import { APP_TITLE, APP_SUBTITLE, MODULES } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-container px-4 py-12">
        <div className="text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
            {APP_TITLE}
          </h1>
          <p className="mx-auto max-w-2xl text-text-secondary">
            {APP_SUBTITLE}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod) => (
            <ModuleCard key={mod.slug} module={mod} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
