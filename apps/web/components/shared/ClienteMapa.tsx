import Card from "./Card";

export default function ClienteMapa({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  if (!latitude || !longitude) {
    return (
      <Card title="Localização">
        <p className="text-[12.5px] text-[#9aa0ac]">
          Nenhuma coordenada cadastrada ainda. Adicione latitude e longitude em &quot;Editar&quot; para exibir o mapa.
        </p>
      </Card>
    );
  }

  const delta = 0.01;
  const bbox = `${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <Card title="Localização">
      <div className="rounded-xl overflow-hidden border border-[#eef0f2]">
        <iframe
          title="Mapa de localização do cliente"
          src={src}
          width="100%"
          height="220"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>
      <a
        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
        target="_blank"
        rel="noreferrer"
        className="text-[11.5px] text-primary hover:underline mt-1.5 inline-block"
      >
        Ver mapa ampliado
      </a>
    </Card>
  );
}
