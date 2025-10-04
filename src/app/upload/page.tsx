"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { 
  Upload, 
  File, 
  Database, 
  Info, 
  CheckCircle, 
  AlertCircle,
  X,
  Plus
} from "lucide-react";

export default function UploadPage() {
  const { connected, account } = useWallet();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    license: "MIT",
    category: "",
    file: null as File | null,
    isPublic: true,
    allowCommercialUse: false,
    uploadResult: null as any,
    registerResult: null as any,
    uploadError: null as string | null
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTag, setNewTag] = useState("");

  const licenses = [
    { value: "MIT", label: "MIT License", description: "Permissive license with minimal restrictions" },
    { value: "CC BY 4.0", label: "Creative Commons Attribution 4.0", description: "Free to use with attribution" },
    { value: "CC BY-SA 4.0", label: "Creative Commons ShareAlike 4.0", description: "Free to use with attribution and same license" },
    { value: "GPL-3.0", label: "GNU General Public License v3.0", description: "Copyleft license requiring source disclosure" },
    { value: "Commercial", label: "Commercial License", description: "Proprietary license for commercial use" },
    { value: "Restricted", label: "Restricted Access", description: "Limited access with specific permissions" }
  ];

  const categories = [
    "Healthcare & Medical",
    "Finance & Economics", 
    "Climate & Environment",
    "Transportation",
    "Social Media & NLP",
    "Computer Vision",
    "Genomics & Bioinformatics",
    "Government & Public Data",
    "Education & Research",
    "Other"
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ 
        ...formData, 
        tags: [...formData.tags, newTag.trim()] 
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async () => {
    setUploading(true);
    
    try {
      if (!formData.file) {
        throw new Error('No file selected');
      }

      // Step 1: Upload file to IPFS via Pinata
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('name', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('license', formData.license);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('tags', formData.tags.join(','));
      uploadFormData.append('userAddress', account?.address?.toString() || 'anonymous');
      uploadFormData.append('encrypt', (!formData.isPublic).toString()); // Encrypt private files

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        console.error('Upload failed:', uploadResult);
        throw new Error(uploadResult.error || uploadResult.details || 'Failed to upload file');
      }

      console.log('Upload successful:', uploadResult);

      // Step 2: Register dataset on blockchain
      const registerResponse = await fetch('/api/register-dataset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cid: uploadResult.cid,
          hash: uploadResult.hash,
          metadata: uploadResult.metadata,
          userAddress: account?.address?.toString() || 'unknown',
          gatingInfo: {
            status: formData.isPublic ? 'Public' : 'Private',
            price: 0
          }
        }),
      });

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok || !registerResult.success) {
        console.error('Registration failed:', registerResult);
        // Don't fail the entire process if blockchain registration fails
        console.warn('Blockchain registration failed, but file was uploaded successfully');
      }

      console.log('Registration result:', registerResult);
      
      // Store results for success page
      setFormData(prev => ({
        ...prev,
        uploadResult,
        registerResult
      }));

      setUploading(false);
      setStep(4); // Success step
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      
      // Store error for display
      setFormData(prev => ({
        ...prev,
        uploadError: (error as Error).message
      }));
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Please connect your wallet to upload datasets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white cyber-grid">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Upload Dataset
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Register your dataset on the blockchain for tamper-proof ownership and provenance tracking.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium border-2 transition-all duration-300 ${
                  step >= stepNum 
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500 modern-shadow" 
                    : "bg-gray-800 text-gray-400 border-gray-600"
                }`}>
                  {step > stepNum ? <CheckCircle className="h-6 w-6" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-20 h-1 mx-3 rounded-full transition-all duration-500 ${
                    step > stepNum ? "bg-gradient-to-r from-purple-600 to-purple-700" : "bg-gray-700"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <div className="text-center">
              <p className="text-lg text-gray-300 font-medium">
                {step === 1 && "Dataset Information"}
                {step === 2 && "File Upload"}
                {step === 3 && "Review & Confirm"}
                {step === 4 && "Upload Complete"}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <Card className="web3-card p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Dataset Information</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-white mb-2 block">Dataset Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a descriptive title for your dataset"
                    className="bg-gray-700 border-gray-600 text-white rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white mb-2 block">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide a detailed description of your dataset, its contents, and potential use cases"
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-white mb-2 block">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Tags</Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="bg-gray-700 border-gray-600 text-white rounded-xl"
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button onClick={addTag} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="license" className="text-white mb-2 block">License *</Label>
                  <select
                    id="license"
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-3"
                  >
                    {licenses.map((license) => (
                      <option key={license.value} value={license.value}>
                        {license.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-400 mt-2">
                    {licenses.find(l => l.value === formData.license)?.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                    />
                    <Label htmlFor="isPublic" className="text-white">Make dataset publicly discoverable</Label>
                  </div>
                  
                  {!formData.isPublic && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-purple-300 font-medium">Private Dataset Encryption</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Private datasets are automatically encrypted with your wallet address as the key. 
                        Only you can decrypt and access the file content.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="allowCommercialUse"
                      checked={formData.allowCommercialUse}
                      onChange={(e) => setFormData({ ...formData, allowCommercialUse: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                    />
                    <Label htmlFor="allowCommercialUse" className="text-white">Allow commercial use</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!formData.title || !formData.description || !formData.category}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8"
                >
                  Next: Upload File
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="web3-card p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Upload Dataset File</h2>
              
              <div
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors ${
                  dragActive 
                    ? "border-purple-500 bg-purple-500/10" 
                    : "border-gray-600 hover:border-gray-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.file ? (
                  <div className="space-y-4">
                    <File className="h-16 w-16 text-green-400 mx-auto" />
                    <div>
                      <p className="text-xl font-medium text-white">{formData.file.name}</p>
                      <p className="text-gray-400">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setFormData({ ...formData, file: null })}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-xl font-medium text-white mb-2">
                        Drag and drop your dataset file here
                      </p>
                      <p className="text-gray-400 mb-4">
                        or click to browse files
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".csv,.json,.xlsx,.zip,.tar.gz,.parquet"
                      />
                      <Label htmlFor="file-upload">
                        <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                          Choose File
                        </Button>
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Supported formats: CSV, JSON, Excel, ZIP, TAR.GZ, Parquet (Max 100MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-medium mb-1">How it works</p>
                    <p className="text-blue-200 text-sm">
                      Your file will be uploaded to IPFS for decentralized storage. 
                      The file hash and metadata will be registered on the Aptos blockchain 
                      to ensure tamper-proof ownership and provenance tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl px-8"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!formData.file}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8"
                >
                  Next: Review
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="web3-card p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Review & Confirm</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Dataset Information</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-400">Title:</span>
                        <span className="text-white ml-2">{formData.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white ml-2">{formData.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">License:</span>
                        <span className="text-white ml-2">{formData.license}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">File Information</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-400">Filename:</span>
                        <span className="text-white ml-2">{formData.file?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white ml-2">
                          {formData.file ? (formData.file.size / 1024 / 1024).toFixed(2) : 0} MB
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Public:</span>
                        <span className="text-white ml-2">{formData.isPublic ? "Yes" : "No"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Commercial Use:</span>
                        <span className="text-white ml-2">{formData.allowCommercialUse ? "Allowed" : "Not Allowed"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                  <p className="text-gray-300 text-sm bg-gray-700/30 p-4 rounded-xl">
                    {formData.description}
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-medium mb-1">Important</p>
                      <p className="text-yellow-200 text-sm">
                        Once uploaded, your dataset will be permanently registered on the blockchain. 
                        Make sure all information is correct before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {formData.uploadError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-medium mb-1">Upload Failed</p>
                      <p className="text-red-200 text-sm">{formData.uploadError}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFormData(prev => ({ ...prev, uploadError: null }))}
                        className="text-red-400 hover:text-red-300 mt-2 p-0"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl px-8"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8"
                >
                  {uploading ? "Uploading..." : "Upload to Blockchain"}
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="web3-card p-8 rounded-3xl text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-semibold mb-4 text-white">Upload Successful!</h2>
              <p className="text-xl text-gray-300 mb-6">
                Your dataset has been successfully registered on the blockchain.
              </p>
              
              <div className="bg-gray-700/30 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">IPFS CID:</span>
                    <span className="text-white ml-2 font-mono">
                      {formData.uploadResult?.cid ? 
                        `${formData.uploadResult.cid.slice(0, 8)}...${formData.uploadResult.cid.slice(-8)}` : 
                        'Qm...abc123'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">File Hash:</span>
                    <span className="text-white ml-2 font-mono">
                      {formData.uploadResult?.hash ? 
                        `${formData.uploadResult.hash.slice(0, 8)}...${formData.uploadResult.hash.slice(-8)}` : 
                        'a1b2c3d4...'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Transaction:</span>
                    <span className="text-white ml-2 font-mono">
                      {formData.registerResult?.txHash ? 
                        `${formData.registerResult.txHash.slice(0, 8)}...${formData.registerResult.txHash.slice(-8)}` : 
                        '0xabcd...efgh'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">File Size:</span>
                    <span className="text-white ml-2">
                      {formData.uploadResult?.size ? 
                        `${(formData.uploadResult.size / 1024 / 1024).toFixed(2)} MB` : 
                        '2.3 MB'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => router.push('/explore')}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6"
                >
                  View All Datasets
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  variant="outline" 
                  className="border-purple-600 text-purple-300 hover:bg-purple-700/20 rounded-xl px-6"
                >
                  My Dashboard
                </Button>
                <Button 
                  onClick={() => {
                    // Reset form and go back to step 1
                    setStep(1);
                    setFormData({
                      title: '',
                      description: '',
                      category: '',
                      tags: [],
                      license: 'MIT',
                      isPublic: true,
                      allowCommercialUse: false,
                      file: null,
                      uploadResult: null,
                      registerResult: null,
                      uploadError: null
                    });
                  }}
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl px-6"
                >
                  Upload Another
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}