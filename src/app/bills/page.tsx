'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BillsPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeBill = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('context', 'Analyze this bill. Explain what it is for, the amount due, due date, and any important terms. Suggest if a reminder is needed.');

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      setAnalysis({
        image: imagePreview,
        analysis: data.analysis,
        fileName: selectedImage.name
      });
    } catch (error) {
      console.error('Error analyzing bill:', error);
      setAnalysis({
        image: imagePreview,
        analysis: 'Sorry, I encountered an error analyzing the bill. Please try again.',
        fileName: selectedImage?.name
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">← Back</Link>
            <h1 className="text-2xl font-bold text-gray-800">💳 Bill Analyzer</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!analysis ? (
          <>
            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Upload Your Bill
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Take a photo of your bill or upload an image, and I'll help you understand it.
              </p>

              {/* Upload Area */}
              <div className="border-4 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                  id="bill-upload"
                />
                <label
                  htmlFor="bill-upload"
                  className="cursor-pointer"
                >
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-xl text-gray-600 mb-2">
                    Click to upload or take a photo
                  </p>
                  <p className="text-lg text-gray-500">
                    Supports: JPG, PNG, HEIC
                  </p>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Bill Preview
                </h3>
                <img
                  src={imagePreview}
                  alt="Bill preview"
                  className="max-w-full h-auto rounded-xl border-2 border-gray-200 mb-6"
                />
                <div className="flex gap-4">
                  <button
                    onClick={analyzeBill}
                    disabled={isLoading}
                    className="flex-1 bg-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Bill'}
                  </button>
                  <button
                    onClick={clearImage}
                    disabled={isLoading}
                    className="bg-gray-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Analysis Results */
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Bill Analysis
            </h2>

            {/* Original Image */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Your Bill:
              </h3>
              <img
                src={analysis.image}
                alt="Uploaded bill"
                className="max-w-full h-auto rounded-lg"
              />
            </div>

            {/* AI Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                What I Found:
              </h3>
              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {analysis.analysis}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                href="/assistant"
                className="flex-1 bg-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-600 transition-colors text-center"
              >
                Ask for Reminder
              </Link>
              <button
                onClick={clearImage}
                className="bg-gray-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-gray-600 transition-colors"
              >
                Analyze Another
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Tips for Best Results</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Good Lighting</h4>
                <p className="text-gray-600">Make sure the bill is well-lit so all text is readable.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">📐</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Flat Surface</h4>
                <p className="text-gray-600">Place the bill on a flat surface to avoid distortion.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🔍</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Complete View</h4>
                <p className="text-gray-600">Include the entire bill, especially amounts and due dates.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">📱</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">High Quality</h4>
                <p className="text-gray-600">Use a high-resolution photo for better text recognition.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}