'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SpeechSpeaker from '@/components/SpeechSpeaker';

interface BillRecord {
  id: number;
  title: string;
  vendor: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category?: string;
  notes?: string;
  invoiceNumber?: string;
}

export default function BillsPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedBills, setSavedBills] = useState<BillRecord[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/bills');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedBills(data);
      }
    } catch (err) {
      console.error('Failed to load bills:', err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setSaveSuccessMsg('');
    }
  };

  const analyzeBill = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setSaveSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append(
        'context',
        'Analyze this bill, utility notice, or letter. Extract vendor, amount due, payment due date, check if it looks like a scam, and summarize in clear simple English.'
      );

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysisResult(data.data || { summary: data.analysis });
    } catch (error) {
      console.error('Error analyzing bill:', error);
      setAnalysisResult({
        summary: 'I encountered an error reading the image. Please ensure the photo is well lit and try again.',
        isSuspicious: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToBills = async () => {
    if (!analysisResult) return;

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: analysisResult.title || selectedImage?.name || 'Scanned Document',
          vendor: analysisResult.vendor || 'Unknown Vendor',
          amount: analysisResult.amountDue ? Number(analysisResult.amountDue) : 0,
          dueDate: analysisResult.dueDate || new Date().toISOString().split('T')[0],
          isPaid: false,
          category: 'utility',
          notes: analysisResult.summary || '',
          invoiceNumber: analysisResult.accountNumber || '',
        }),
      });

      if (res.ok) {
        setSaveSuccessMsg('✅ Bill saved to your records & day planner!');
        fetchBills();
      }
    } catch (err) {
      console.error('Failed to save bill:', err);
    }
  };

  const handleTogglePaid = async (id: number, currentPaid: boolean) => {
    try {
      const res = await fetch('/api/bills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPaid: !currentPaid }),
      });
      if (res.ok) {
        fetchBills();
      }
    } catch (err) {
      console.error('Error toggling paid state:', err);
    }
  };

  const handleDeleteBill = async (id: number) => {
    if (!confirm('Are you sure you want to remove this bill?')) return;
    try {
      const res = await fetch(`/api/bills?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBills();
      }
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setSaveSuccessMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-sky-50 rounded-3xl p-6 sm:p-10 border-2 border-sky-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-4xl shadow-md">
            📄
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              Bill & Document Scanner
            </h1>
            <p className="text-stone-600 text-lg font-medium">
              Take a photo of any bill or letter. SeniorBuddy extracts the amount, due date, and verifies if it is legitimate.
            </p>
          </div>
        </div>

        <SpeechSpeaker
          text="Welcome to the Bill and Document Scanner. Take or upload a photo of any bill, letter, or notice, and I will explain who sent it, how much you owe, and when it is due."
          label="Listen to Guide"
          size="md"
        />
      </div>

      {/* Upload or Take Photo Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-black text-stone-900">Upload or Snap Photo</h2>

        <div className="border-3 border-dashed border-stone-300 hover:border-amber-400 rounded-3xl p-8 sm:p-12 text-center transition-all bg-stone-50/50">
          <input
            type="file"
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            id="bill-image-input"
          />
          <label htmlFor="bill-image-input" className="cursor-pointer block">
            <span className="text-6xl block mb-4 animate-bounce">📷</span>
            <p className="text-2xl font-black text-stone-800 mb-2">
              Tap Here to Take Photo or Upload Image
            </p>
            <p className="text-stone-500 text-base font-medium">
              Accepts photos of paper bills, receipts, utility invoices, or bank notices
            </p>
          </label>
        </div>

        {/* Selected Image Preview & Analyze Button */}
        {imagePreview && (
          <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-black text-stone-900">Photo Ready for Analysis</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={imagePreview}
                alt="Document preview"
                className="max-h-64 rounded-2xl border-2 border-stone-300 object-contain bg-white shadow-xs"
              />
              <div className="flex-1 space-y-4">
                <p className="text-stone-700 font-bold text-lg">
                  File: <span className="font-normal">{selectedImage?.name}</span>
                </p>
                <p className="text-sm text-stone-600">
                  SeniorBuddy will read the text, extract payment amounts, check due dates, and inspect for fraud signals.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={analyzeBill}
                    disabled={isLoading}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-black text-lg px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>{isLoading ? '⏳ Analyzing with AI...' : '🔍 Read & Analyze Document'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={isLoading}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-lg px-5 py-3.5 rounded-xl cursor-pointer"
                  >
                    Clear Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="space-y-6 pt-4 border-t border-stone-200">
            {/* Scam Alert if Suspicious */}
            {analysisResult.isSuspicious ? (
              <div className="p-6 rounded-2xl bg-red-100 border-3 border-red-500 text-red-950 space-y-2 shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🚨</span>
                  <h3 className="text-2xl font-black text-red-900">Warning: Potential Scam Detected!</h3>
                </div>
                <p className="text-lg font-bold">
                  {analysisResult.suspicionReason ||
                    'This document contains urgent threats or requests unusual payment methods.'}
                </p>
                <p className="text-base font-medium">
                  Recommendation: {analysisResult.actionNeeded || 'Do not pay. Check with family or call customer service directly.'}
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-xl font-black text-emerald-900">Document Verified</h3>
                  <p className="text-base font-medium">No fraudulent indicators found. Appears to be a standard bill or letter.</p>
                </div>
              </div>
            )}

            {/* Extracted Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-stone-50 border-2 border-stone-200">
                <p className="text-xs uppercase font-bold text-stone-500">Provider / Vendor</p>
                <p className="text-2xl font-black text-stone-900 mt-1">
                  {analysisResult.vendor || 'Unknown Provider'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300">
                <p className="text-xs uppercase font-bold text-amber-800">Amount Due</p>
                <p className="text-3xl font-black text-amber-900 mt-1">
                  {analysisResult.amountDue !== null && analysisResult.amountDue !== undefined
                    ? `$${Number(analysisResult.amountDue).toFixed(2)}`
                    : 'Not Specified'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-sky-50 border-2 border-sky-300">
                <p className="text-xs uppercase font-bold text-sky-800">Payment Due Date</p>
                <p className="text-2xl font-black text-sky-950 mt-1">
                  {analysisResult.dueDate || 'No Date Detected'}
                </p>
              </div>
            </div>

            {/* Simple Explanation & Highlights */}
            <div className="p-6 rounded-2xl bg-stone-100 border border-stone-300 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-stone-900">Simple Explanation</h3>
                <SpeechSpeaker
                  text={`${analysisResult.summary || ''} What you need to do: ${analysisResult.actionNeeded || ''}`}
                  size="sm"
                  label="Read Explanation"
                />
              </div>

              <p className="text-lg text-stone-800 leading-relaxed font-medium">
                {analysisResult.summary}
              </p>

              {analysisResult.keyHighlights && analysisResult.keyHighlights.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-stone-200">
                  <p className="text-sm font-bold text-stone-600 uppercase tracking-wider">Key Details:</p>
                  <ul className="list-disc pl-5 space-y-1 text-base text-stone-800">
                    {analysisResult.keyHighlights.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.actionNeeded && (
                <div className="p-4 rounded-xl bg-white border border-stone-300 font-bold text-base text-stone-900">
                  👉 Next Step: {analysisResult.actionNeeded}
                </div>
              )}
            </div>

            {/* Save Action */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleSaveToBills}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>💾 Save to My Bills</span>
              </button>
              {saveSuccessMsg && (
                <span className="text-emerald-700 font-bold text-base animate-pulse">
                  {saveSuccessMsg}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Saved Bills List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900">Saved Bills & Due Dates</h2>
            <p className="text-stone-600 text-sm">Track which bills are paid and which need attention.</p>
          </div>
        </div>

        {savedBills.length === 0 ? (
          <p className="text-stone-500 py-6 text-center">No saved bills in your records.</p>
        ) : (
          <div className="space-y-4">
            {savedBills.map((bill) => (
              <div
                key={bill.id}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  bill.isPaid ? 'bg-stone-50 border-stone-200' : 'bg-amber-50/50 border-amber-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => handleTogglePaid(bill.id, bill.isPaid)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-all ${
                      bill.isPaid
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-stone-400 bg-white hover:border-emerald-500 text-transparent'
                    }`}
                    title={bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                  >
                    ✓
                  </button>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-xl font-black ${
                          bill.isPaid ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}
                      >
                        {bill.vendor} — ${Number(bill.amount).toFixed(2)}
                      </h3>
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                          bill.isPaid ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-950'
                        }`}
                      >
                        {bill.isPaid ? 'Paid' : 'Due Soon'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                      Due Date: <span className="font-bold text-stone-800">{bill.dueDate}</span>
                      {bill.invoiceNumber && ` · Invoice #${bill.invoiceNumber}`}
                    </p>
                    {bill.notes && <p className="text-xs text-stone-500 mt-1">{bill.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <SpeechSpeaker
                    text={`Bill from ${bill.vendor} for $${bill.amount.toFixed(2)} due on ${bill.dueDate}. Status: ${
                      bill.isPaid ? 'Paid' : 'Unpaid'
                    }.`}
                    size="sm"
                    label="Listen"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteBill(bill.id)}
                    className="text-stone-400 hover:text-red-600 p-2 rounded-xl text-lg font-bold cursor-pointer"
                    title="Delete bill record"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}