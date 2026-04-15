// src/utils/api.js
import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

class ApiClient {
  async getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Room endpoints
  async getRooms() {
    return this.request('/rooms/');
  }

  async getRoom(roomId) {
    return this.request(`/rooms/${roomId}`);
  }

  async addRoom(roomData) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    // Create FormData
    const formData = new FormData();
    formData.append('title', roomData.title);
    formData.append('price', roomData.price);
    formData.append('type', roomData.type);
    formData.append('location', roomData.location);
    formData.append('contact_number', roomData.contact_number);
    formData.append('amenities', roomData.amenities.join(','));
    formData.append('description', roomData.description || '');
    formData.append('furnished', roomData.furnished);
    formData.append('gender_preference', roomData.gender_preference);

    // Add images - convert base64 to File objects if needed
    if (roomData.images && roomData.images.length > 0) {
      roomData.images.forEach(img => {
        if (typeof img === 'string' && img.startsWith('data:')) {
          // Convert base64 to File
          const byteString = atob(img.split(',')[1]);
          const mimeString = img.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const file = new File([blob], `image-${Date.now()}.${mimeString.split('/')[1]}`, { type: mimeString });
          formData.append('images', file);
        } else if (img instanceof File) {
          formData.append('images', img);
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/rooms/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add room');
    }

    return await response.json();
  }

  async getRecommendedRooms() {
    return this.request('/rooms/recommend');
  }

  // Swipe endpoints
  async swipeRoom(swipeData) {
    return this.request('/swipe/', {
      method: 'POST',
      body: JSON.stringify(swipeData)
    });
  }

  async getSwipeHistory() {
    return this.request('/swipe/history');
  }

  async getLikedRooms() {
    return this.request('/swipe/liked');
  }

  async getMatches() {
    return this.request('/swipe/matches');
  }

  // Onboarding endpoints
  async onboardUser(userData) {
    return this.request('/onboard/', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getOnboardStatus() {
    return this.request('/onboard/status');
  }
}

export const apiClient = new ApiClient();

