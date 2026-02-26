/**
 * Axios HTTP client with interceptors for authentication and error handling
 */

import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenService } from "./token.service";
import type { ApiError } from "./types";

// Base URL can be configured via environment variable
const BASE_URL = window.__ENV__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/";

// Refresh endpoint
const REFRESH_ENDPOINT = "/api/auth/refresh";

/**
 * Custom request config with auth flag
 */
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _requiresAuth?: boolean;
    _isRefreshRequest?: boolean;
}

/**
 * Create and configure the Axios instance
 */
function createHttpClient(): AxiosInstance {
    const client = axios.create({
        baseURL: BASE_URL,
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Request interceptor: handle token injection and refresh
    client.interceptors.request.use(
        async (config: CustomAxiosRequestConfig) => {
            const requiresAuth = config._requiresAuth ?? true;
            const isRefreshRequest = config._isRefreshRequest ?? false;

            // Skip auth handling for non-authenticated requests
            if (!requiresAuth) {
                return config;
            }

            // Check if token needs refresh (skip for refresh requests to prevent infinite loop)
            if (
                !isRefreshRequest &&
                tokenService.hasToken() &&
                tokenService.isTokenStale()
            ) {
                try {
                    await tokenService.refreshToken(async () => {
                        // Call refresh endpoint with auth (requires current token)
                        const response = await client.post(
                            REFRESH_ENDPOINT,
                            {},
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                _requiresAuth: true,
                                _isRefreshRequest: true,
                            } as CustomAxiosRequestConfig,
                        );
                        return (response.data as { token: string }).token;
                    });
                } catch (error) {
                    // Token refresh failed, request will proceed without token
                    $app.logger.warn("Token refresh failed:", error);
                }
            }

            // Inject token if available
            const token = tokenService.getToken();
            if (token && requiresAuth) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error),
    );

    // Response interceptor: normalize errors
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            const apiError: ApiError = {
                status: error.response?.status || 0,
                message: error.response?.data
                    ? (error.response.data as any).message || error.message
                    : error.message,
                details: error.response?.data,
            };

            // Clear token on 401 Unauthorized
            if (apiError.status === 401) {
                tokenService.clearToken();
            }

            return Promise.reject(apiError);
        },
    );

    return client;
}

// Export singleton axios instance
export const httpClient = createHttpClient();
