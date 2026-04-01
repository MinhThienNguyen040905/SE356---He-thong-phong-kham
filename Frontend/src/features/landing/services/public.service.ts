import api from "../../../lib/api";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface LandingStats {
  patientCount: number;
  doctorCount: number;
  visitCount: number;
  experienceYears: number;
  satisfactionRate: number;
}

/**
 * Send a contact form message to the backend
 */
export const sendContactMessage = async (
  data: ContactFormData
): Promise<ContactResponse> => {
  try {
    const response = await api.post("/contact", data);
    return {
      success: true,
      message: response.data.message || "Gửi tin nhắn thành công!",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
    };
  }
};

/**
 * Get landing page statistics
 */
export const getLandingStats = async (): Promise<LandingStats> => {
  try {
    const response = await api.get("/public/stats");
    return response.data;
  } catch (error: any) {
    // Return default stats if the API call fails
    return {
      patientCount: 0,
      doctorCount: 0,
      visitCount: 0,
      experienceYears: 15,
      satisfactionRate: 98,
    };
  }
};

// Export as a service object for consistency with the component's usage
export const PublicService = {
  sendContactMessage,
  getLandingStats,
};
