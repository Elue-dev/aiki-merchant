interface AuthTitleProps {
  title: string
  description?: string
}

export default function AuthTitle({ title, description }: AuthTitleProps) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}
