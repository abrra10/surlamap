"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";

// Step 1: Basic Information
const BasicInfoSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  event_type: z.string().min(1, "Event type is required"),
  category: z.string().min(1, "Category is required"),
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

// Step 3: Media
const MediaSchema = z.object({
  image: z
    .instanceof(FileList)
    .optional()
    .refine((files) => {
      return (
        !files ||
        files.length === 0 ||
        (files.length === 1 &&
          ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
            files[0].type
          ))
      );
    }, "File must be a valid image (jpeg, png, webp)"),
});

// Combined schema for the entire form
const EventFormSchema =
  BasicInfoSchema.merge(EventDetailsSchema).merge(MediaSchema);

// Form types
type EventFormValues = z.infer<typeof EventFormSchema>;

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
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure storage bucket exists
  const ensureStorageBucket = async () => {
    try {
      const supabase = createClient();
      // Check if the bucket exists by trying to get its details
      const { data, error } = await supabase.storage.getBucket("event_images");

      // If bucket doesn't exist, create it
      if (error && error.message.includes("does not exist")) {
        const { data: newBucket, error: createError } =
          await supabase.storage.createBucket("event_images", {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024, // 5MB
          });

        if (createError) {
          console.error("Error creating storage bucket:", createError);
        }
      }
    } catch (error) {
      console.error("Error checking storage bucket:", error);
    }
  };

  // Check for bucket when component loads
  useEffect(() => {
    ensureStorageBucket();
  }, []);

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      event_type: "",
      category: "",
      tags: "",
      date: "",
      location: "",
      meeting_link: "",
      seats: 0,
      price: 0,
      registration_deadline: "",
    },
    mode: "onChange",
  });

  // Register the file input with React Hook Form
  const { ref: imageInputRef, ...imageInputProps } = methods.register("image");

  const {
    handleSubmit,
    formState: { errors, isValid },
  } = methods;

  const categories = [
    "Conference",
    "Workshop",
    "Seminar",
    "Networking",
    "Social",
    "Other",
  ];

  const eventTypes = ["In-person", "Virtual", "Hybrid"];

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3));
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

  const onSubmit = async (data: EventFormValues) => {
    try {
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

      // Process tags (convert comma-separated string to array)
      const tagsArray = data.tags
        ? data.tags.split(",").map((tag) => tag.trim())
        : [];

      // Handle image upload if a file was selected
      let image_url = "";
      const imageFile = data.image?.[0];

      if (imageFile) {
        // Upload file to Supabase Storage
        const fileName = `${userData.user.id}_${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event_images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          setErrorMessage(uploadError.message || "Failed to upload image");
          setIsSubmitting(false);
          return;
        }

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("event_images").getPublicUrl(fileName);

        image_url = publicUrl;
      }

      // Insert the event into the database
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert({
          name: data.name,
          description: data.description,
          event_type: data.event_type,
          category: data.category,
          tags: tagsArray,
          date: new Date(data.date).toISOString(),
          location: data.location,
          meeting_link: data.meeting_link,
          seats: data.seats,
          price: data.price,
          registration_deadline: new Date(
            data.registration_deadline
          ).toISOString(),
          image_url: image_url,
          organizer_id: userData.user.id,
          status: "upcoming", // Default status for new events
        })
        .select("id")
        .single();

      if (eventError) {
        console.error("Error creating event:", eventError);
        setErrorMessage(eventError.message || "Failed to create event");
        setIsSubmitting(false);
        return;
      }

      // Call onSuccess callback with the new event ID
      if (onSuccess && eventData) {
        onSuccess(eventData.id);
      }

      // Close the form
      onClose();
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit(onSubmit)}>
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
                        {type}
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
                        {category}
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
                  Event Image
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
                      className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 cursor-pointer"
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
                    ref={(e) => {
                      // Store reference in both React Hook Form and our local ref
                      imageInputRef(e);
                      fileInputRef.current = e;
                    }}
                    onChange={(e) => {
                      handleFileChange(e);
                      imageInputProps.onChange(e);
                    }}
                    onBlur={imageInputProps.onBlur}
                    name={imageInputProps.name}
                  />
                  {methods.formState.errors.image && (
                    <p className="text-red-500 text-xs">
                      {methods.formState.errors.image.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 bg-blue-50 p-3 rounded-md">
                <h3 className="text-sm font-medium">Ready to Create Event?</h3>
                <p className="text-xs text-gray-600">
                  Please review all your event details before submitting. Once
                  submitted, your event will be created with "upcoming" status.
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
                disabled={isSubmitting}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
