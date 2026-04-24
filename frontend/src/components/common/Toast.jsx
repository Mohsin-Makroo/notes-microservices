export default function Toast({ message, colors }) {
  if (!message) return null;
  
  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300"
      style={{ background: '#674432', color: '#f7f1ee' }}
    >
      {message}
    </div>
  );
}