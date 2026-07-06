export function CirculoAmigosShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="circulo-amigos-shell flex min-h-screen flex-col">
      <div className="mx-auto flex w-full min-h-0 max-w-6xl flex-1 flex-col px-0">
        {children}
      </div>
    </div>
  );
}
