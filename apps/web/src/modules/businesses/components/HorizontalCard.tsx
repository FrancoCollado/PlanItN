import './HorizontalCard.scss';

export interface HorizontalCardProps {
  category: string;
  title: string;
  description: string;
  date: string;
  onClick?: () => void;
}

export function HorizontalCard({
  category,
  title,
  description,
  date,
  onClick,
}: HorizontalCardProps) {
  return (
    <article className="horizontal-card" onClick={onClick}>
      <div className="card-accent" />
      <div className="card-content">
        <div className="card-header">
          <span className="card-category">{category}</span>
          <span className="card-date">{date}</span>
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </article>
  );
}