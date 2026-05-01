import API_URL from './config';
import { getToken } from './auth';

export const listarGranjas = async () => {
    const response = await fetch(`${API_URL}/api/granjas`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await response.json();
};