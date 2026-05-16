export const Loader = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizes[size]} animate-spin rounded-full border-3 border-primary-200 border-t-primary-600`} />
      {text && <p className="text-sm text-dark-500 dark:text-dark-400">{text}</p>}
    </div>
  );
};

export const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-4 bg-dark-200 dark:bg-dark-700 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
    <div className="text-center">
      <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="mt-4 text-dark-500 dark:text-dark-400 font-medium">Loading...</p>
    </div>
  </div>
);

export default Loader;
