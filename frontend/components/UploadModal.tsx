'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import { useDataset } from '@/context/DatasetContext';

export default function UploadModal() {
  const { uploadModalOpen, setUploadModalOpen, refreshDatasets, setCurrentDataset, loadDemoDataset } = useDataset();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!uploadModalOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const valid = ['.csv', '.xlsx', '.xls', '.json'].includes(ext);
    if (!valid) {
      setErrorMsg(`Unsupported file type: ${ext}. Please upload a CSV, XLSX, XLS, or JSON dataset.`);
      return false;
    }
    if (file.size === 0) {
      setErrorMsg('This file is empty (0 bytes). Please upload a valid dataset.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 50MB maximum platform limit.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        if (!datasetName) {
          setDatasetName(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        if (!datasetName) {
          setDatasetName(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        }
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setErrorMsg(null);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 15 : p));
    }, 200);

    try {
      const newDs = await api.uploadDataset(selectedFile, datasetName || undefined);
      clearInterval(interval);
      setUploadProgress(100);
      await refreshDatasets();
      setCurrentDataset(newDs);
      setTimeout(() => {
        setUploading(false);
        setUploadModalOpen(false);
        setSelectedFile(null);
        setDatasetName('');
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setUploading(false);
      setErrorMsg(err.message || 'Failed to upload dataset.');
    }
  };

  const handleTryDemo = async () => {
    setUploading(true);
    setErrorMsg(null);
    try {
      await loadDemoDataset();
      setUploading(false);
      setUploadModalOpen(false);
    } catch (err: any) {
      setUploading(false);
      setErrorMsg(err.message || 'Failed to load demo dataset.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Upload Dataset</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">CSV, XLSX, XLS, or JSON (up to 50MB)</p>
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <UploadCloud className="h-6 w-6" />
          </div>
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <span className="font-medium text-slate-900 dark:text-white text-sm">{selectedFile.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB — Click to change file
              </span>
            </div>
          ) : (
            <>
              <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                Drop your dataset here, or <span className="text-blue-600 dark:text-blue-400 underline">Browse Files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports CSV, Excel (XLSX/XLS), and JSON datasets</p>
            </>
          )}
        </div>

        {/* Dataset Custom Name Input */}
        {selectedFile && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Dataset Name (Optional)
            </label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="e.g. Q4 Sales Performance"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> Profiling & analyzing dataset...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTryDemo}
            disabled={uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Try Demo Dataset
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              disabled={uploading}
              className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!selectedFile || uploading}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                'Upload & Profile'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
