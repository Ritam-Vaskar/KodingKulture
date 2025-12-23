const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const loader = (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-dark-700 border-t-primary-500 rounded-full animate-spin`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
