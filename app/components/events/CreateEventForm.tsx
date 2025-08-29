"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/app/utils/supabase/client";

type CreateEventFormProps = {
  onClose: () => void;
  onSuccess?: (eventId: string) => void;
};

export default function CreateEventForm({
  onClose,
  onSuccess,
}: CreateEventFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    event_type: "in_person",
    category: "",
    tags: "",
    date: new Date().toISOString().slice(0, 16),
    location: "",
    meeting_link: "",
    seats: 100,
    price: 0,
    registration_deadline: new Date().toISOString().slice(0, 16),
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Event types and categories
  const eventTypes = ["in_person", "online"];
  const categories = [
    "conferences_professional",
    "music_entertainment",
    "food_lifestyle",
    "sports_fitness",
    "arts_culture",
    "tech_innovation",
    "other",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name || formData.name.length < 3) {
          newErrors.name = "Event name must be at least 3 characters";
        }
        if (!formData.description || formData.description.length < 10) {
          newErrors.description = "Description must be at least 10 characters";
        }
        if (!formData.event_type) {
          newErrors.event_type = "Event type is required";
        }
        if (!formData.category) {
          newErrors.category = "Category is required";
        }
        break;
      case 2:
        if (!formData.date) {
          newErrors.date = "Event date is required";
        }
        if (!formData.location) {
          newErrors.location = "Location is required";
        }
        if (!formData.seats || formData.seats <= 0) {
          newErrors.seats = "Seats must be a positive number";
        }
        if (formData.price < 0) {
          newErrors.price = "Price cannot be negative";
        }
        if (!formData.registration_deadline) {
          newErrors.registration_deadline = "Registration deadline is required";
        }
        break;
      case 3:
        if (!imagePreview) {
          newErrors.image = "An image is required";
        }
        break;
    }

    // Additional validation for step 2
    if (step === 2 && Object.keys(newErrors).length === 0) {
      const eventDate = new Date(formData.date);
      const registrationDeadline = new Date(formData.registration_deadline);
      const now = new Date();

      if (eventDate <= now) {
        newErrors.date = "Event date must be in the future";
      }
      if (registrationDeadline >= eventDate) {
        newErrors.registration_deadline =
          "Registration deadline must be before the event date";
      }
      if (registrationDeadline <= now) {
        newErrors.registration_deadline =
          "Registration deadline must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 3));
      setErrorMessage("");
    } else {
      setErrorMessage("Please fix the errors above.");
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setErrorMessage("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) {
      setErrorMessage("Please fix the errors above.");
      return;
    }

    try {
      if (isUploadingImage) {
        setErrorMessage("Please wait for image upload to complete");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      const supabase = createClient();

      // Get the current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setErrorMessage("You must be logged in to create an event");
        setIsSubmitting(false);
        return;
      }

      // Handle image upload if an image was selected
      let image_url = null;
      if (
        fileInputRef.current?.files &&
        fileInputRef.current.files.length > 0
      ) {
        setIsUploadingImage(true);

        try {
          const file = fileInputRef.current.files[0];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;
          const filePath = `event-images/${fileName}`;

          // Upload image to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("events")
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Error uploading image: ${uploadError.message}`);
          }

          // Get the public URL for the uploaded image
          const {
            data: { publicUrl },
          } = supabase.storage.from("events").getPublicUrl(filePath);

          image_url = publicUrl;
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to handle image upload"
          );
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return;
        }

        setIsUploadingImage(false);
      }

      // Prepare the event data
      const eventData = {
        ...formData,
        image_url,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
        organizer_id: userData.user.id,
        status: "draft",
      };

      // Insert the event
      const { data: createdEvent, error: eventError } = await supabase
        .from("events")
        .insert(eventData)
        .select("id")
        .single();

      if (eventError) {
        throw new Error(`Error creating event: ${eventError.message}`);
      }

      if (!createdEvent) {
        throw new Error("No event data returned after creation");
      }

      if (onSuccess) {
        onSuccess(createdEvent.id);
      }

      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-5">
      {/* Header and Step Indicator */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold">Create New Event</h2>
          <p className="text-xs text-gray-600">Step {step} of 3</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {step > 1 ? "✓" : "1"}
          </div>
          <div
            className={`w-8 h-1 transition-colors ${
              step >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {step > 2 ? "✓" : "2"}
          </div>
          <div
            className={`w-8 h-1 transition-colors ${
              step >= 3 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {step > 3 ? "✓" : "3"}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md mb-3 text-xs">
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Event Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-1.5 border rounded-md text-sm"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full p-1.5 border rounded-md text-sm"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs mt-0.5">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Event Type*
                </label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  className="w-full p-1.5 border rounded-md text-sm"
                >
                  <option value="">Select Type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "in_person"
                        ? "In Person"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.event_type && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.event_type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-1.5 border rounded-md text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "conferences_professional"
                        ? "Conferences & Professional Events"
                        : category === "music_entertainment"
                        ? "Music & Entertainment"
                        : category === "food_lifestyle"
                        ? "Food & Lifestyle"
                        : category === "sports_fitness"
                        ? "Sports & Fitness"
                        : category === "arts_culture"
                        ? "Arts & Culture"
                        : category === "tech_innovation"
                        ? "Tech & Innovation"
                        : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g. tech, workshop, coding"
                className="w-full p-1.5 border rounded-md text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Event Date*
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-1.5 border rounded-md text-sm"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Registration Deadline*
                </label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleInputChange}
                  className="w-full p-1.5 border rounded-md text-sm"
                />
                {errors.registration_deadline && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.registration_deadline}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Location*
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-1.5 border rounded-md text-sm"
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-0.5">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Meeting Link (for virtual events)
              </label>
              <input
                type="url"
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleInputChange}
                placeholder="https://zoom.us/..."
                className="w-full p-1.5 border rounded-md text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Available Seats*
                </label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-1.5 border rounded-md text-sm"
                />
                {errors.seats && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.seats}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Price*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full p-1.5 border rounded-md text-sm"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.price}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media */}
        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Event Image*
                <span className="text-red-500 ml-1">Required</span>
              </label>
              <div className="flex flex-col items-center space-y-2">
                {imagePreview ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                    <p className="text-xs text-gray-500">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPEG, PNG, WebP
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {errors.image && (
                  <p className="text-red-500 text-xs">{errors.image}</p>
                )}
              </div>
            </div>

            <div className="mt-3 bg-blue-50 p-3 rounded-md">
              <h3 className="text-sm font-medium">Ready to Create Event?</h3>
              <p className="text-xs text-gray-600">
                Please review all your event details before submitting. Once
                submitted, your event will be created with &quot;draft&quot;
                status.
                <br />
                <span className="text-red-600 font-medium">
                  Note: An event image is required.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-5">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              ← Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage || !imagePreview}
              className={`px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUploadingImage
                ? "Uploading Image..."
                : isSubmitting
                ? "Creating Event..."
                : "Create Event"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
