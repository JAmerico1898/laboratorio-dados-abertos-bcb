import ModuleHeader from "@/components/layout/ModuleHeader";
import FeedbackForm from "./client";

export default function FeedbackPage() {
  return (
    <>
      <ModuleHeader
        icon="💬"
        title="Sugestões e Feedback"
        subtitle="Encontrou um bug, tem uma ideia ou quer tirar uma dúvida? Envie aqui."
      />
      <FeedbackForm />
    </>
  );
}
