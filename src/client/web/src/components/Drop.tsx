import { Upload } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import PreviewImages from "./PreviewImages";

export const Drop = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFormat, setSelectedFormat] = useState();

  const onDrop = useCallback((acceptedFiles: any) => {
    console.log(acceptedFiles);
    const newFiles = acceptedFiles.slice(0, 5).map((file: any) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prev: any) => [...prev, ...newFiles].slice(0, 5));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  return (
    <div className="bg-gray-300 p-[100px]">
      {/* // for image drop */}
      <div
        {...getRootProps()}
        className={`bg-purple-200 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
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

        {/* // show the images on drop */}
        <PreviewImages
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          files={files}
        />
      </div>
    </div>
  );
};

export default Drop;
