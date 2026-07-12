import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const defaultFormData = {
  customer_id: "",
  first_name: "",
  last_name: "",
  email: "",
  role: "",
  dob: "",
  gender: "",
  phone_number: "",
  phone_code: "",
  district: "",
  taluk_town: "",
  state: "",
  zipcode: "",
  religion: "",
  caste: "",
  mother_tongue: "",
  maritial_status: "",
  education: "",
  profession: "",
  annual_income: "",
  height: "",
  about_self: "",
  partner_preference: "",
  subscription_type: "",
  subscription_view_access: 0,
  image: [] as any[],
  video: "" as any,
  transaction: [],
  public_verify: false,
};

export default function CustomerModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CustomerModalProps) {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "subscription_view_access") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.image && formData.image.filter((img: any) => img.url).length >= 5) {
        alert("Maximum 5 images allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => {
          const currentImages = Array.isArray(prev.image) ? prev.image : [];
          const validImages = currentImages.filter((img: any) => img.url);
          const isFirst = validImages.length === 0;
          const newImages = [...validImages, { url: base64String, default: isFirst }];
          return { ...prev, image: newImages };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const setAsDefaultImage = (index: number) => {
    setFormData((prev) => {
      const currentImages = Array.isArray(prev.image) ? prev.image : [];
      const validImages = currentImages.filter((img: any) => img.url);
      const newImages = validImages.map((img: any, i: number) => ({
        ...img,
        default: i === index,
      }));
      return { ...prev, image: newImages };
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const currentImages = Array.isArray(prev.image) ? prev.image : [];
      const validImages = currentImages.filter((img: any) => img.url);
      const newImages = [...validImages];
      const removed = newImages.splice(index, 1)[0];
      
      // If we removed the default image, set the first available image as default
      if (removed?.default && newImages.length > 0) {
        newImages[0].default = true;
      }
      
      return { ...prev, image: newImages };
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isMp4 = file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
      if (!isMp4) {
        alert("Please upload only MP4 video files.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          video: { url: base64String },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setFormData((prev) => ({ ...prev, video: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Customer" : "Create Customer"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div className="mb-8">
              <label className="text-sm font-medium text-gray-700 mb-3 block">Profile Pictures (Min 1, Max 5)</label>
              <div className="flex flex-wrap gap-4">
                {Array.isArray(formData.image) && formData.image.filter((img: any) => img.url).map((img: any, idx: number) => (
                  <div key={idx} className={`relative w-32 h-32 rounded-xl border-4 overflow-hidden group ${img.default ? 'border-violet-500' : 'border-gray-200'}`}>
                    <img src={img.url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                      {!img.default && (
                        <button 
                          type="button" 
                          onClick={() => setAsDefaultImage(idx)} 
                          className="text-xs bg-violet-600 text-white px-2 py-1 rounded hover:bg-violet-700 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)} 
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {img.default && (
                      <div className="absolute bottom-0 left-0 right-0 bg-violet-600 text-white text-[10px] font-bold text-center py-0.5">
                        DEFAULT
                      </div>
                    )}
                  </div>
                ))}
                
                {(!Array.isArray(formData.image) || formData.image.filter((img: any) => img.url).length < 5) && (
                  <label className="w-32 h-32 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-violet-500 hover:border-violet-500 cursor-pointer transition-colors bg-gray-50">
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs font-medium">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div className="mb-8">
              <label className="text-sm font-medium text-gray-700 mb-3 block">Profile Video (Max 1 MP4)</label>
              <div className="flex flex-wrap gap-4">
                {(formData.video && (typeof formData.video === 'string' ? formData.video : formData.video.url)) ? (
                  <div className="relative w-64 h-40 rounded-xl border-4 border-violet-500 overflow-hidden group bg-black">
                    <video src={typeof formData.video === 'string' ? formData.video : formData.video.url} className="w-full h-full object-contain" controls />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                      <button 
                        type="button" 
                        onClick={removeVideo} 
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-48 h-32 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-violet-500 hover:border-violet-500 cursor-pointer transition-colors bg-gray-50">
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs font-medium">Add MP4</span>
                    <input
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Basic Details */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone Code</label>
                <input type="text" name="phone_code" value={formData.phone_code} onChange={handleChange} placeholder="+91" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input required type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="text" name="dob" value={formData.dob} onChange={handleChange} placeholder="DD-MM-YYYY" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <input type="text" name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Marital Status</label>
                <input type="text" name="maritial_status" value={formData.maritial_status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">District</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Taluk/Town</label>
                <input type="text" name="taluk_town" value={formData.taluk_town} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Zipcode</label>
                <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              {/* Personal Details */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Religion</label>
                <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Caste</label>
                <input type="text" name="caste" value={formData.caste} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mother Tongue</label>
                <input type="text" name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Education</label>
                <input type="text" name="education" value={formData.education} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Profession</label>
                <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Annual Income</label>
                <input type="text" name="annual_income" value={formData.annual_income} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Height</label>
                <input type="text" name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Subscription Type</label>
                <input type="text" name="subscription_type" value={formData.subscription_type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Subscription View Access</label>
                <input type="number" name="subscription_view_access" value={formData.subscription_view_access} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">About Self</label>
                <input type="text" name="about_self" value={formData.about_self} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">Partner Preference</label>
                <input type="text" name="partner_preference" value={formData.partner_preference} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              {/* Booleans/Misc */}
              <div className="space-y-1 flex flex-col justify-center mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="public_verify" checked={formData.public_verify} onChange={handleChange} className="w-5 h-5 accent-violet-500 rounded" />
                  <span className="text-sm font-medium text-gray-700">Publicly Verified</span>
                </label>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            form="customer-form"
            type="submit"
            className="px-6 py-2 bg-violet-600 rounded-lg text-white font-medium hover:bg-violet-700 transition-colors"
          >
            {initialData ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
