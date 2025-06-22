import { useState } from 'react';
import Snackbar from '../components/Snackbar';

async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'abcd123'); // your unsigned preset

  const res = await fetch('https://api.cloudinary.com/v1_1/dtuk850ut/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }
  return data.secure_url;
}

export default function AddItemPage() {
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('Shirt');
  const [itemDescription, setItemDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setSnackbarType('error');
      setSnackbarMessage('You can only upload a maximum of 5 additional images.');
      setSnackbarVisible(true);
      e.target.value = '';
      setAdditionalImages([]);
    } else {
      setAdditionalImages(files);
      if (snackbarMessage === 'You can only upload a maximum of 5 additional images.') {
        setSnackbarVisible(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbarVisible(false);
    setSnackbarMessage('');
    setSnackbarType('success');
    setLoading(true);

    if (!itemName || !itemType || !itemDescription || !coverImage) {
      setSnackbarType('error');
      setSnackbarMessage('Please fill in all required fields.');
      setSnackbarVisible(true);
      setLoading(false);
      return;
    }

    try {
      // 1. Upload cover image
      const coverImageUrl = await uploadToCloudinary(coverImage);

      // 2. Upload additional images in parallel
      const additionalImageUrls = await Promise.all(
        additionalImages.map(img => uploadToCloudinary(img))
      );

      // 3. Send URLs to backend
      const response = await fetch('http://localhost:3002/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName,
          type: itemType,
          description: itemDescription,
          coverImage: coverImageUrl,
          additionalImages: additionalImageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarType('error');
        setSnackbarMessage(errorData.message || 'Failed to add item');
        setSnackbarVisible(true);
        throw new Error(errorData.message || 'Failed to add item');
      }

      const result = await response.json();
      setSnackbarType('success');
      setSnackbarMessage(result.message);
      setSnackbarVisible(true);
      setItemName('');
      setItemType('Shirt');
      setItemDescription('');
      setCoverImage(null);
      setAdditionalImages([]);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMessage(error instanceof Error ? error.message : 'An error occurred');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Snackbar
        message={snackbarMessage}
        type={snackbarType}
        isVisible={snackbarVisible}
        onClose={() => setSnackbarVisible(false)}
      />
      
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Add New Item</h2>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Name */}
            <div className="md:col-span-2">
              <label htmlFor="itemName" className="block text-sm font-semibold text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
              />
            </div>

            {/* Item Type */}
            <div>
              <label htmlFor="itemType" className="block text-sm font-semibold text-gray-700 mb-2">
                Item Type *
              </label>
              <select
                id="itemType"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              >
                <option>Shirt</option>
                <option>Pant</option>
                <option>Shoes</option>
                <option>Sports Gear</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="itemDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                Item Description *
              </label>
              <textarea
                id="itemDescription"
                rows={4}
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Describe your item..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                required
              ></textarea>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Images
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image */}
              <div>
                <label htmlFor="coverImage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="coverImage"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="coverImage"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-600">Click to upload cover image</span>
                    {coverImage && (
                      <span className="text-xs text-green-600 mt-1">✓ {coverImage.name}</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label htmlFor="additionalImages" className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Images (Max 5)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="additionalImages"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="additionalImages"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-600">Click to upload additional images</span>
                    {additionalImages.length > 0 && (
                      <span className="text-xs text-green-600 mt-1">✓ {additionalImages.length} file(s) selected</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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