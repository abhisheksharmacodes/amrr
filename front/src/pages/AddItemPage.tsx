import { useState } from 'react';
import Snackbar from '../components/Snackbar';

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'abcd123');

  const res = await fetch('https://api.cloudinary.com/v1_1/dtuk850ut/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(data.error?.message || 'Upload failed');
  }
  return data.secure_url;
}

export default function AddItemPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('Shirt');
  const [description, setDescription] = useState('');
  const [coverImg, setCoverImg] = useState<File | null>(null);
  const [extraImgs, setExtraImgs] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setMsgType('error');
      setMsg('Max 5 extra images allowed');
      setShowMsg(true);
      e.target.value = '';
      setExtraImgs([]);
    } else {
      setExtraImgs(files);
      if (msg === 'Max 5 extra images allowed') {
        setShowMsg(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowMsg(false);
    setMsg('');
    setMsgType('success');
    setIsLoading(true);

    if (!name || !type || !description || !coverImg) {
      setMsgType('error');
      setMsg('Fill all required fields');
      setShowMsg(true);
      setIsLoading(false);
      return;
    }

    try {
      const coverUrl = await uploadImage(coverImg);
      const extraUrls = await Promise.all(extraImgs.map(img => uploadImage(img)));

      const response = await fetch('http://localhost:3002/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          description,
          coverImage: coverUrl,
          additionalImages: extraUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMsgType('error');
        setMsg(errorData.message || 'Something went wrong');
        setShowMsg(true);
        throw new Error(errorData.message || 'Something went wrong');
      }

      const result = await response.json();
      setMsgType('success');
      setMsg(result.message);
      setShowMsg(true);
      setName('');
      setType('Shirt');
      setDescription('');
      setCoverImg(null);
      setExtraImgs([]);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setMsgType('error');
      // Handle browser's "Failed to fetch" error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setMsg('Something went wrong');
      } else {
        setMsg(error instanceof Error ? error.message : 'Something went wrong');
      }
      setShowMsg(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Snackbar
        message={msg}
        type={msgType}
        isVisible={showMsg}
        onClose={() => setShowMsg(false)}
      />
      
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Add New Item</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="itemName" className="block text-sm font-semibold text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="itemType" className="block text-sm font-semibold text-gray-700 mb-2">
                Item Type *
              </label>
              <select
                id="itemType"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              >
                <option>Shirt</option>
                <option>Pant</option>
                <option>Shoes</option>
                <option>Sports Gear</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="itemDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                Item Description *
              </label>
              <textarea
                id="itemDescription"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                required
              ></textarea>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Images
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="coverImage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="coverImage"
                    onChange={(e) => setCoverImg(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="coverImage"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-600">Click to upload cover image</span>
                    {coverImg && (
                      <span className="text-xs text-green-600 mt-1">✓ {coverImg.name}</span>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="additionalImages" className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Images (Max 5)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="additionalImages"
                    multiple
                    onChange={handleExtraImages}
                    className="hidden"
                  />
                  <label
                    htmlFor="additionalImages"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-600">Click to upload additional images</span>
                    {extraImgs.length > 0 && (
                      <span className="text-xs text-green-600 mt-1">✓ {extraImgs.length} file(s) selected</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>Add Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 