import React, { useRef, useState } from "react";
import { IoCameraOutline } from "react-icons/io5";
import { MdOutlineFileUpload, MdDeleteOutline } from "react-icons/md";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const RecycleCamera = () => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photos, setPhotos] = useState([]);

  const recyclableTypes = [
    "Plastic",
    "Aluminum Can",
    "Glass",
    "Cardboard",
    "Paper",
    "Metal",
    "Wood",
    "Cloth",
  ];

  const getRandomType = () =>
    recyclableTypes[Math.floor(Math.random() * recyclableTypes.length)];

  // Capture from webcam
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    const baseWeight = parseFloat((Math.random() * 2 + 0.5).toFixed(2)); // base weight in kg
    const basePoints = Math.floor(Math.random() * 50) + 10;

    const newPhoto = {
      id: Date.now(),
      src: imageSrc,
      type: getRandomType(),
      baseWeight,
      basePoints,
      weight: `${baseWeight.toFixed(2)} kg`,
      points: basePoints,
      estimatedValue: `$${(Math.random() * 5 + 1).toFixed(2)}`,
      quantity: 1,
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setIsCameraOpen(false);
  };

  // Upload file
  const handleButtonClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);

      const baseWeight = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
      const basePoints = Math.floor(Math.random() * 50) + 10;

      const newPhoto = {
        id: Date.now(),
        src: imageURL,
        type: getRandomType(),
        baseWeight,
        basePoints,
        weight: `${baseWeight.toFixed(2)} kg`,
        points: basePoints,
        estimatedValue: `$${(Math.random() * 5 + 1).toFixed(2)}`,
        quantity: 1,
      };

      setPhotos((prev) => [newPhoto, ...prev]);
    }
  };

  // Delete photo
  const deletePhoto = (id) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  // Update quantity for a specific photo
  const handleQuantityChange = (id, newQuantity) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === id) {
          const updatedQty = newQuantity < 1 ? 1 : newQuantity;
          const updatedWeight = photo.baseWeight * updatedQty;
          const updatedPoints = photo.basePoints * updatedQty;

          return {
            ...photo,
            quantity: updatedQty,
            weight: `${updatedWeight.toFixed(2)} kg`,
            points: updatedPoints,
          };
        }
        return photo;
      })
    );
  };

  return (
    <div className="border rounded-xl p-4 bg-white border-gray-300 w-full h-fit">
      {/* Header */}
      <div className="flex items-center gap-2 text-xl mb-2">
        <IoCameraOutline className="text-2xl" />
        <h2 className="font-semibold">AI Image Recognition</h2>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        Scan or upload an image to identify recyclable materials
      </p>

      {/* Placeholder or Live Camera */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl p-6 min-h-[280px] transition-all">
        {isCameraOpen ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="rounded-lg shadow-lg w-full"
              videoConstraints={{
                width: 150,
                height: 80,
                facingMode: "environment",
              }}
            />
            <button
              onClick={capturePhoto}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium"
            >
              Capture Photo
            </button>
          </div>
        ) : (
          <>
            <IoCameraOutline className="text-8xl text-gray-400 mb-3" />
            <h3 className="font-semibold text-lg">Ready to Scan</h3>
            <p className="text-gray-600 text-sm mb-3 text-center">
              Take a photo or upload an image to get started
            </p>
            <button
              onClick={() => setIsCameraOpen(true)}
              className="cursor-pointer rounded-xl text-sm px-3 w-40 h-9 text-white bg-[#186933] hover:bg-[#124d26] inline-flex items-center justify-center gap-1"
            >
              <IoCameraOutline className="text-lg" />
              Take Photo
            </button>
          </>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleButtonClick}
          className="cursor-pointer rounded-xl border border-gray-300 text-sm px-3 w-full h-9 hover:bg-gray-200 inline-flex items-center justify-center gap-1"
        >
          <MdOutlineFileUpload className="text-xl" />
          Upload Image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Photos History */}
      {photos.length > 0 && (
        <div className="mt-6 flex flex-col gap-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative flex flex-col md:flex-row items-center md:items-start gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm"
            >
              {/* Delete Button */}
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 cursor-pointer"
                title="Delete Photo"
              >
                <MdDeleteOutline className="text-red-600 text-2xl" />
              </button>

              {/* Image Preview */}
              <img
                src={photo.src}
                alt="Captured or Uploaded"
                className="rounded-lg shadow-lg w-60 select-none"
              />

              {/* Description */}
              <div className="flex flex-col gap-2 text-gray-700 text-sm w-full">
                <h3 className="font-semibold text-base mb-1">
                  Detected Item Info
                </h3>

                <div className="flex justify-between">
                  <span className="font-medium">Type of Object:</span>
                  <span>{photo.type}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Weight:</span>
                  <span>{photo.weight}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Points Earned:</span>
                  <span>{photo.points} pts</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Estimated Value:</span>
                  <span>{photo.estimatedValue}</span>
                </div>

                {/* Quantity Field */}
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Quantity:</span>
                  <input
                    type="number"
                    value={photo.quantity}
                    min={1}
                    onChange={(e) =>
                      handleQuantityChange(photo.id, parseInt(e.target.value))
                    }
                    className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/pickup")}
                    className="bg-[#186933] hover:bg-[#124d26] text-white text-sm px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Schedule Pickup
                  </button>
                  <button
                    onClick={() => navigate("/pickup#centers")}
                    className="border border-gray-400 hover:bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Show Centers
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecycleCamera;
