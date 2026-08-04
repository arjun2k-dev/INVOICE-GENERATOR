export const StatusBadge = ({ status }) => {
  const getBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-success text-white';
      case 'REJECTED':
        return 'bg-danger text-white';
      case 'PENDING':
      default:
        return 'bg-warning text-dark';
    }
  };

  return (
    <span className={`badge rounded-pill ${getBadgeClass(status)} px-3 py-2 fw-semibold`}>
      {status ? status.toUpperCase() : 'PENDING'}
    </span>
  );
};