function EmptyState({ title, description, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {description}
      </p>
      {action && (
        <button className="btn btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
