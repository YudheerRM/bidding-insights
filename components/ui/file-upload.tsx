import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onFileUpload: (result: { s3Key: string; cdnUrl: string }) => void;
  fileType: 'document' | 'report';
  currentFile?: { name: string; url: string } | null;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function FileUpload({
  onFileUpload,
  fileType,
  currentFile,
  onFileRemove,
  accept = '.pdf,.doc,.docx',
  maxSize = 10,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF and Word documents are allowed');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Add filename to result for display
      const uploadResult = {
        ...result.data,
        fileName: file.name,
      };
      
      onFileUpload(uploadResult);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    if (onFileRemove) {
      onFileRemove();
    }
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {!currentFile && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${uploading ? 'pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          <div className="flex flex-col items-center space-y-2">
            <Upload className={`h-8 w-8 ${uploading ? 'text-gray-400' : 'text-gray-500'}`} />
            <div>
              <p className="text-sm font-medium">
                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-center text-gray-600">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Current File Display */}
      {currentFile && !uploading && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <File className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium truncate">
              {currentFile.name || 'Uploaded file'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.open(currentFile.url, '_blank')}
              className="text-blue-600 hover:text-blue-700"
            >
              View
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
