interface Props {
  title: string
  text: string
}

export function EmptyState({ title, text }: Props) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
