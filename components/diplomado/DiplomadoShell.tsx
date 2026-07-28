export function DiplomadoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="diplomado-shell flex min-h-screen flex-col">
      <div className="diplomado-phone mx-auto flex w-full min-h-0 flex-1 flex-col">
        <div className="diplomado-phone__content flex-1">{children}</div>
      </div>
    </div>
  );
}
