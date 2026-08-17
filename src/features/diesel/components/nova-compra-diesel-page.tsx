import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { CompraDieselForm } from "@/features/diesel/components/compra-diesel-form";

export function NovaCompraDieselPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/diesel" });

  return (
    <PaginaCadastroDedicada
      backLabel="Diesel"
      backTo="/admin/diesel"
      title="Compra de diesel"
      tag="tanque interno"
    >
      <CompraDieselForm onCancel={voltar} onSuccess={voltar} />
    </PaginaCadastroDedicada>
  );
}
