import { STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'badge-neutral';
  return <span className={colorClass}>{status}</span>;
};

export default StatusBadge;
