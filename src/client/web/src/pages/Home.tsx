import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Image as ImageIcon, X } from "lucide-react";

const ImageConverter = () => {
  const [files, setFiles] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("jpg");
  const [convertedImages, setConvertedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // On dropping the file
  const onDrop = useCallback((acceptedFiles: any) => {
    const newFiles = acceptedFiles.slice(0, 5).map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  // Handling the file remove
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload Handler
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    const userUploadId = Date.now() + "-" + Math.round(Math.random() * 1e9);

    files.forEach((file) => {
      formData.append("photos", file);
    });
    formData.append("targetFormat", selectedFormat);
    formData.append("userUploadId", userUploadId);

    try {
      setProgress(20);
      const response = await fetch("http://localhost:8080/api/upload-images", {
        method: "POST",
        body: formData,
        headers: {
          userUploadId: userUploadId,
        },
      });

      setProgress(50);
      const { token } = await response.json();
      localStorage.setItem("token", token);
      console.log("Pooling with token: ", token);
      await pollForCompletion(token);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Checking the completion pooling
  const pollForCompletion = async (token: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/check-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        if (response.status === 200) {
          const statusResponse = await response.json();
          return statusResponse;
        } else {
          return { status: "error" };
        }
      } catch (error) {
        return { status: "error" };
      }
    };

    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        const { status } = await checkStatus();
        setProgress((p) => Math.min(90, p + 10));
        console.log("Status", status);

        if (status === "error") {
          reject();
          setProgress(100);
          clearInterval(interval);
        }

        if (status === "completed") {
          clearInterval(interval);
          const imagesResponse = await fetch(
            "http://localhost:8080/api/download-images-path",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            }
          );
          const { allImagesName } = await imagesResponse.json();
          setConvertedImages(allImagesName);
          setProgress(100);
          resolve();
        }
      }, 1000);
    });
  };

  // downloading the image
  const handleDownload = async (filename: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/download-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, filename }),
      });
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const imageOriginalNameEndIndex = filename.indexOf("-");
      const imageOriginalName = filename.slice(0, imageOriginalNameEndIndex);
      link.download = imageOriginalName;
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // on every file change download the image
  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  // get the token from local storage and handle download if any
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        pollForCompletion(token);
      } catch (error) {
        return;
      }
    }
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Image Format Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop images here, or click to select"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Maximum 5 images allowed</p>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={file.name} className="relative group">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 items-center">
          <p>Convert To</p>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WEBP</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="flex-1"
          >
            {isUploading ? "Converting..." : "Convert Images"}
          </Button>
        </div>

        {isUploading && <Progress value={progress} className="w-full" />}

        {convertedImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Converted Images</h3>
            <div className="space-y-2">
              {convertedImages.map((image) => (
                <div
                  key={image}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon size={20} className="text-gray-500" />
                    <span className="text-sm truncate">{image}</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleDownload(image)}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageConverter;
