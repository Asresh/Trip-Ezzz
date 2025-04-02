export default function LoadingIndicator() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-xl">
        <div className="animate-spin mx-auto h-16 w-16 text-primary-500">
          <i className="fas fa-spinner text-5xl"></i>
        </div>
        <h3 className="mt-4 text-xl font-medium text-gray-900">Creating Your Perfect Itinerary</h3>
        <p className="mt-2 text-gray-500">Our AI is crafting a personalized travel plan just for you...</p>
        <div className="mt-6 bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary-500 h-2.5 rounded-full w-3/4" style={{ width: '75%' }}></div>
        </div>
        <p className="mt-4 text-xs text-gray-500">This might take up to 30 seconds</p>
      </div>
    </div>
  );
}
