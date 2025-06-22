import { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Snackbar from '../components/Snackbar';
import { FaSpinner } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:3002';

interface Item {
  _id: string;
  name: string;
  type: string;
  description: string;
  coverImage: string;
  additionalImages: string[];
}

export default function ViewItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const [enquireLoading, setEnquireLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/items`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleEnquire = async (item: Item) => {
    setEnquireLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/enquire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarType('error');
        setSnackbarMessage(errorData.message || 'Failed to send enquiry');
        setSnackbarVisible(true);
        setEnquireLoading(false);
        throw new Error(errorData.message || 'Failed to send enquiry');
      }

      const result = await response.json();
      setSnackbarType('success');
      setSnackbarMessage(result.message);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Enquiry error:', error);
      setSnackbarType('error');
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to send enquiry');
      setSnackbarVisible(true);
    } finally {
      setEnquireLoading(false);
    }
  };

  if (loading) return <p>Loading items...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Snackbar
        message={snackbarMessage}
        type={snackbarType}
        isVisible={snackbarVisible}
        onClose={() => setSnackbarVisible(false)}
      />
      <h2 className="text-4xl text-center font-bold text-gray-900 mb-8">View Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.length ? items.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.coverImage}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{item.name}</h2>
            </div>
          </div>
        )) : <span>Added items will show up</span>}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-1">Type: {selectedItem.type}</p>
            <p className="mb-4">{selectedItem.description}</p>

            <Carousel showThumbs={false} dynamicHeight={false} showArrows={true}>
              {[selectedItem.coverImage, ...selectedItem.additionalImages].map((img, index) => (
                <div key={index} style={{ width: '400px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', margin: '0 auto' }}>
                  <img
                    src={img}
                    alt={`${selectedItem.name} image ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              ))}
            </Carousel>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleEnquire(selectedItem)}
                className="bg-indigo-600 hover:bg-indigo-800 cursor-pointer text-white font-bold py-2 px-4 rounded flex items-center justify-center min-w-[100px]"
                disabled={enquireLoading}
              >
                {enquireLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : null}
                Enquire
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="border border-solid border-red-500 cursor-pointer text-red-500 font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 