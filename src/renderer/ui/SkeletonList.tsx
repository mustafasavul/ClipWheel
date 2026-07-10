export function SkeletonList() {
  return <div className="history-list">{Array.from({ length: 7 }).map((_, index) => <div className="skeleton-row" key={index} />)}</div>;
}

