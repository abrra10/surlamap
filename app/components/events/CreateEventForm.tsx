"use client";

import { useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";

// Step 1: Basic Information
const BasicInfoSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  event_type: z
    .string()
    .refine(
      (val) => val === "" || ["in_person", "online"].includes(val),
      "Event type must be valid"
    ),
  category: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        [
          "conference",
          "workshop",
          "seminar",
          "networking",
          "social",
          "other",
        ].includes(val),
      "Category must be valid"
    ),
  tags: z.string().optional(),
});

// Step 2: Event Details
const EventDetailsSchema = z.object({
  date: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required"),
  meeting_link: z.string().optional(),
  seats: z.coerce.number().int().positive("Seats must be a positive number"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  registration_deadline: z.string().min(1, "Registration deadline is required"),
});

// Step 3: Media - Handle FileList in a way that works with SSR
const MediaSchema = z.object({
  image: z.custom<FileList>((files) => {
    return (
      files instanceof FileList &&
      files.length > 0 &&
      ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
        files[0].type
      )
    );
  }, "An image is required (JPEG, PNG, or WebP)"),
});

// Combined schema for the entire form
const EventFormSchema =
  BasicInfoSchema.merge(EventDetailsSchema).merge(MediaSchema);

// Form types
export type EventFormValues = z.infer<typeof EventFormSchema>;

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

  // Debug environment variables
  console.log("Environment variables check:", {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10),
    supabaseKeyAvailable: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  // Try different formats for event_type that might match the database constraint
  const eventTypes = ["in_person", "online"];

  // Database-compatible categories
  const categories = [
    "conference",
    "workshop",
    "seminar",
    "networking",
    "social",
    "other",
  ];

  // Database-compatible status values - using draft since it's the default in DB
  const eventStatuses = ["draft", "published", "cancelled", "completed"];

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      event_type: "in_person",
      category: "",
      tags: "",
      date: new Date().toISOString().slice(0, 16),
      location: "Online",
      meeting_link: "",
      seats: 100,
      price: 0,
      registration_deadline: new Date().toISOString().slice(0, 16),
      image: undefined,
    },
    mode: "onChange",
  });

  // Register the file input with React Hook Form
  const { ref: imageInputRef, ...imageInputProps } = methods.register("image");

  const {
    handleSubmit,
    formState: { errors, isValid },
  } = methods;

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
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

  const onSubmit = async (formData: EventFormValues) => {
    console.log("onSubmit called with:", formData);
    try {
      if (isUploadingImage) {
        setErrorMessage("Please wait for image upload to complete");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      console.log("Starting form submission with data:", formData);
      console.log("Image data:", formData.image);

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
      if (formData.image instanceof FileList && formData.image.length > 0) {
        console.log("Processing image upload...");
        setIsUploadingImage(true);

        try {
          const file = formData.image[0];
          console.log("File details:", {
            name: file.name,
            type: file.type,
            size: file.size,
          });

          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;
          const filePath = `event-images/${fileName}`;

          console.log("Uploading to path:", filePath);
          // Upload image to Supabase Storage
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("events").upload(filePath, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(`Error uploading image: ${uploadError.message}`);
          }

          console.log("Upload successful:", uploadData);

          // Get the public URL for the uploaded image
          const {
            data: { publicUrl },
          } = supabase.storage.from("events").getPublicUrl(filePath);

          console.log("Generated public URL:", publicUrl);
          image_url = publicUrl;
        } catch (error) {
          console.error("Error handling image:", error);
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
      } else {
        console.log("No image selected or invalid image data");
      }

      // Prepare the event data
      const { image, ...eventDataWithoutImage } = formData;
      const eventData = {
        ...eventDataWithoutImage,
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

      console.log("Final event data to submit:", eventData);

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

      console.log("Event created successfully:", createdEvent);

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

  // Add this function to validate before moving to next step
  const validateStep = async () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = await methods.trigger([
          "name",
          "description",
          "event_type",
          "category",
        ]);
        break;
      case 2:
        isValid = await methods.trigger([
          "date",
          "location",
          "seats",
          "price",
          "registration_deadline",
        ]);
        break;
      case 3:
        // Image is now required
        isValid = await methods.trigger(["image"]);
        break;
    }

    return isValid;
  };

  return (
    <div className="bg-white rounded-lg p-5">
      {/* Header and Step Indicator in a single row */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold">Create New Event</h2>
          <p className="text-xs text-gray-600">Step {step} of 3</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            1
          </div>
          <div
            className={`w-6 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
          ></div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            2
          </div>
          <div
            className={`w-6 h-1 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
          ></div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            3
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md mb-3 text-xs">
          {errorMessage}
        </div>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            let msg = "";
            if (errors.image?.message) {
              msg =
                typeof errors.image.message === "string"
                  ? errors.image.message
                  : "Please fix the errors above.";
            } else {
              msg = "Please fix the errors above.";
            }
            console.log("Form validation errors:", errors);
            setErrorMessage(msg);
          })}
          className="space-y-4"
        >
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Event Name*
                </label>
                <input
                  type="text"
                  {...methods.register("name")}
                  className="w-full p-1.5 border rounded-md text-sm"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Description*
                </label>
                <textarea
                  {...methods.register("description")}
                  rows={2}
                  className="w-full p-1.5 border rounded-md text-sm"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Event Type*
                  </label>
                  <select
                    {...methods.register("event_type")}
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
                      {errors.event_type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Category*
                  </label>
                  <select
                    {...methods.register("category")}
                    className="w-full p-1.5 border rounded-md text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.category.message}
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
                  {...methods.register("tags")}
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
                    {...methods.register("date")}
                    className="w-full p-1.5 border rounded-md text-sm"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Registration Deadline*
                  </label>
                  <input
                    type="datetime-local"
                    {...methods.register("registration_deadline")}
                    className="w-full p-1.5 border rounded-md text-sm"
                  />
                  {errors.registration_deadline && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.registration_deadline.message}
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
                  {...methods.register("location")}
                  className="w-full p-1.5 border rounded-md text-sm"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Meeting Link (for virtual events)
                </label>
                <input
                  type="url"
                  {...methods.register("meeting_link")}
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
                    {...methods.register("seats")}
                    min="1"
                    className="w-full p-1.5 border rounded-md text-sm"
                  />
                  {errors.seats && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.seats.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Price*
                  </label>
                  <input
                    type="number"
                    {...methods.register("price")}
                    min="0"
                    step="0.01"
                    className="w-full p-1.5 border rounded-md text-sm"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.price.message}
                    </p>
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
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                          methods.setValue("image", new DataTransfer().files, {
                            shouldValidate: true,
                          });
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
                    {...methods.register("image")}
                    onChange={(e) => {
                      handleFileChange(e);
                      methods.setValue(
                        "image",
                        e.target.files && e.target.files.length > 0
                          ? e.target.files
                          : new DataTransfer().files,
                        { shouldValidate: true }
                      );
                    }}
                    ref={fileInputRef}
                  />
                  {methods.formState.errors.image && (
                    <p className="text-red-500 text-xs">
                      {String(methods.formState.errors.image.message)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 bg-blue-50 p-3 rounded-md">
                <h3 className="text-sm font-medium">Ready to Create Event?</h3>
                <p className="text-xs text-gray-600">
                  Please review all your event details before submitting. Once
                  submitted, your event will be created with "draft" status.
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
                className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-md"
              >
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || !imagePreview}
                className={`px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
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
      </FormProvider>
    </div>
  );
}
