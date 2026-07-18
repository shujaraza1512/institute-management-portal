// Thin wrapper around a scrollable table -- just standardizes the card
// container/border/header styling every Admin management page uses, so
// each page only needs to supply its own <thead>/<tbody> markup.
function DataTable({ children }) {
  return <div className="bg-white rounded-card shadow-card overflow-x-auto data-table">{children}</div>;
}

export default DataTable;
