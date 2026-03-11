import { Customer } from '@/data/mock-customers';

export interface CustomerCardProps {
  customer: Customer;
  onSelect: (id: string) => void;
}

function getHealthColor(score: number): string {
  if (score <= 30) return 'text-red-500';
  if (score <= 70) return 'text-yellow-500';
  return 'text-green-500';
}

function getHealthLabel(score: number): string {
  if (score <= 30) return 'Poor';
  if (score <= 70) return 'Moderate';
  return 'Good';
}

export default function CustomerCard({ customer, onSelect }: CustomerCardProps) {
  const { id, name, company, healthScore, domains } = customer;
  const healthColor = getHealthColor(healthScore);
  const hasDomains = domains && domains.length > 0;
  const primaryDomain = hasDomains ? domains[0] : null;
  const extraDomainCount = hasDomains && domains.length > 1 ? domains.length - 1 : 0;

  return (
    <div
      className="w-full md:w-80 rounded-lg shadow-sm border border-gray-200 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(id);
      }}
    >
      <div className="mb-1 text-base font-semibold text-gray-900">{name}</div>
      <div className="mb-2 text-sm text-gray-600">{company}</div>

      <div className="flex items-center gap-2 mb-2">
        <span className={`text-sm font-medium ${healthColor}`}>
          ● {healthScore}
        </span>
        <span className={`text-xs ${healthColor}`}>{getHealthLabel(healthScore)}</span>
      </div>

      {hasDomains && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">{primaryDomain}</span>
          {extraDomainCount > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              +{extraDomainCount} {extraDomainCount === 1 ? 'domain' : 'domains'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
