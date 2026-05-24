import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  link?: string;
  linkText?: string;
}

export default function SectionHeader({ title, link, linkText = 'Barchasi' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="section-title">{title}</h2>
      {link && (
        <Link
          to={link}
          className="text-sm text-primary-600 font-medium hover:text-primary-700"
        >
          {linkText} →
        </Link>
      )}
    </div>
  );
}
