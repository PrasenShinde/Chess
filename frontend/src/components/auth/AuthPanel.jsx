export default function AuthPanel({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-12">
      <div className="rounded-2xl border border-accent bg-cream p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-ink/65">{subtitle}</p>
        ) : null}
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-8 border-t border-accent pt-6">{footer}</div> : null}
      </div>
    </div>
  )
}
