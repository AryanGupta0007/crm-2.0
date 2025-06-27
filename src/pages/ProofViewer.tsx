import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ProofViewer = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [leadId, setLeadId] = useState<string>('');
  const [field, setField] = useState<string>('');

  useEffect(() => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const leadIdParam = urlParams.get('leadId');
    const fieldParam = urlParams.get('field');
    
    setLeadId(leadIdParam || '');
    setField(fieldParam || '');

    if (!leadIdParam || !fieldParam) {
      setError('Missing lead ID or field parameter');
      setLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const url = `http://localhost:8000/api/gen/lead/${leadIdParam}/download-image/?field=${fieldParam}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setLoading(false);
      } catch (err) {
        setError('Failed to load image');
        setLoading(false);
      }
    };

    loadImage();
  }, []);

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${field}_proof_${leadId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const getFieldDisplayName = (field: string) => {
    switch (field) {
      case 'payment_ss': return 'Payment Proof';
      case 'discount_ss': return 'Discount Proof';
      case 'books_ss': return 'Books Proof';
      case 'form_ss': return 'Form Proof';
      default: return field;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maritime-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proof...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {getFieldDisplayName(field || '')}
                </h1>
                <p className="text-sm text-gray-500">Lead ID: {leadId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowFullscreen(!showFullscreen)}
                variant="outline"
                size="sm"
              >
                {showFullscreen ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                {showFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div className={`${showFullscreen ? 'fixed inset-0 z-50 bg-black' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <div className={`${showFullscreen ? 'h-full flex items-center justify-center' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}`}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={`${getFieldDisplayName(field || '')} for Lead ${leadId}`}
              className={`${showFullscreen ? 'max-h-full max-w-full object-contain' : 'max-w-full h-auto rounded-lg shadow-sm'}`}
              onError={() => setError('Failed to load image')}
            />
          )}
        </div>
      </div>

      {/* Fullscreen overlay close button */}
      {showFullscreen && (
        <button
          onClick={() => setShowFullscreen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
        >
          <EyeOff size={20} />
        </button>
      )}
    </div>
  );
}; 