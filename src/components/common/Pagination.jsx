const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  const range = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) range.push(i);

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <p className="text-sm text-dark-500 dark:text-dark-400">Showing page {page} of {pages} ({total} items)</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-ghost text-sm disabled:opacity-40">←</button>
        {range[0] > 1 && <><button onClick={() => onPageChange(1)} className="btn-ghost text-sm">1</button>{range[0] > 2 && <span className="px-1 text-dark-400">...</span>}</>}
        {range.map((p) => (
          <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-500 text-white' : 'btn-ghost'}`}>{p}</button>
        ))}
        {range[range.length - 1] < pages && <>{range[range.length - 1] < pages - 1 && <span className="px-1 text-dark-400">...</span>}<button onClick={() => onPageChange(pages)} className="btn-ghost text-sm">{pages}</button></>}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pages} className="btn-ghost text-sm disabled:opacity-40">→</button>
      </div>
    </div>
  );
};

export default Pagination;
