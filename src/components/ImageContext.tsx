// ImageContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type ImageContextType = {
  imageUrl: string | null;
  image: File | null;
  setImageInfo: (url: string, file: File) => void;
  setImageUrl: (url: string) => void; // Renamed for generic use
};

type ImageProviderProps = {
  children: ReactNode;
};

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImageContext = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
};

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  // State to track image URL and file
  const [imageUrl, setImageUrlState] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  // Function to set both image URL and file
  const setImageInfo = (url: string, file: File) => {
    setImageUrlState(url);
    setImage(file);
  };

  // Function to set only the image URL
  const setImageUrl = (url: string) => {
    setImageUrlState(url);
  };

  return (
    <ImageContext.Provider
      value={{ imageUrl, image, setImageInfo, setImageUrl }}
    >
      {children}
    </ImageContext.Provider>
  );
};
