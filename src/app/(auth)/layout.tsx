export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
            F
          </div>
          <span className="text-lg font-semibold">Financy</span>
        </div>
        {children}
      </div>
    </div>
  )
}
