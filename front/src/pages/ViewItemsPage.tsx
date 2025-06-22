import { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Snackbar from '../components/Snackbar';
import { FaSpinner } from 'react-icons/fa';

const API_URL = 'https://amrr-five.vercel.app/api';

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
  const [selected, setSelected] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMsg, setShowMsg] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [enquireLoading, setEnquireLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/items`, {
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
        // Handle browser's "Failed to fetch" error
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setMsgType('error');
          setMsg('Something went wrong');
          setShowMsg(true);
        } else {
          setMsgType('error');
          setMsg('Something went wrong');
          setShowMsg(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleEnquire = async (item: Item) => {
    setEnquireLoading(true);
    try {
      const response = await fetch(`${API_URL}/enquire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMsgType('error');
        setMsg(errorData.message || 'Something went wrong');
        setShowMsg(true);
        setEnquireLoading(false);
        throw new Error(errorData.message || 'Something went wrong');
      }

      const result = await response.json();
      setMsgType('success');
      setMsg(result.message);
      setShowMsg(true);
    } catch (error) {
      console.error('Enquiry error:', error);
      setMsgType('error');
      // Handle browser's "Failed to fetch" error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setMsg('Something went wrong');
      } else {
        setMsg(error instanceof Error ? error.message : 'Something went wrong');
      }
      setShowMsg(true);
    } finally {
      setEnquireLoading(false);
    }
  };

  if (loading) return <p>Loading items...</p>;

  return (
    <div>
      <Snackbar
        message={msg}
        type={msgType}
        isVisible={showMsg}
        onClose={() => setShowMsg(false)}
      />
      <h2 className="text-4xl text-center font-bold text-gray-900 mb-8">View Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.length ? items.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setSelected(item)}
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

      {selected && (
        <div className="fixed inset-0 bg-[#000000cc] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
            <p className="text-gray-600 mb-1">Type: {selected.type}</p>
            <p className="mb-4">{selected.description}</p>

            <Carousel showThumbs={false} dynamicHeight={false} showArrows={true}>
              {[selected.coverImage, ...selected.additionalImages].map((img, index) => (
                <div key={index} style={{ width: '400px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', margin: '0 auto' }}>
                  <img
                    src={img}
                    alt={`${selected.name} image ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              ))}
            </Carousel>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleEnquire(selected)}
                className="bg-indigo-600 hover:bg-indigo-800 cursor-pointer text-white font-bold py-2 px-4 rounded flex items-center justify-center min-w-[100px]"
                disabled={enquireLoading}
              >
                {enquireLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : null}
                Enquire
              </button>
              <button
                onClick={() => setSelected(null)}
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