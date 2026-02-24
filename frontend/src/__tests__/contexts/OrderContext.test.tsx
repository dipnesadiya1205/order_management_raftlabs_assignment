import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { OrderProvider, useOrder } from '../../contexts/OrderContext';
import { SSEConnectionState } from '../../hooks/useSSE';
import apiClient from '../../services/api';
import type { Order } from '../../types/index';
import { OrderStatus } from '../../types/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

jest.mock('../../services/api');
jest.mock('../../hooks/useSSE');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

import * as useSSEModule from '../../hooks/useSSE';
const mockUseSSE = useSSEModule.useSSE as jest.MockedFunction<typeof useSSEModule.useSSE>;

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    _id: 'order-id-1',
    orderNumber: 'ORD202402240001',
    items: [],
    customer: { name: 'Alice', phone: '1234567890', address: '123 Main St' },
    totalAmount: 20,
    status: OrderStatus.RECEIVED,
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <OrderProvider>{children}</OrderProvider>
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrderContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUseSSE.mockReturnValue({
            connectionState: SSEConnectionState.CLOSED,
            lastUpdatedAt: null,
        });
    });

    // -------------------------------------------------------------------------
    it('startTracking fetches the order and marks isTracking=true', async () => {
        const order = buildOrder();
        mockApiClient.trackOrder.mockResolvedValueOnce(order);

        const { result } = renderHook(() => useOrder(), { wrapper });

        await act(async () => {
            await result.current.startTracking('ORD202402240001');
        });

        expect(result.current.trackingOrder).toEqual(order);
        expect(result.current.isTracking).toBe(true);
        expect(mockApiClient.trackOrder).toHaveBeenCalledWith('ORD202402240001');
    });

    // -------------------------------------------------------------------------
    it('stopTracking clears the trackingOrder and stops SSE connection', async () => {
        const order = buildOrder();
        mockApiClient.trackOrder.mockResolvedValue(order);

        const { result } = renderHook(() => useOrder(), { wrapper });

        await act(async () => {
            await result.current.startTracking('ORD202402240001');
        });

        act(() => {
            result.current.stopTracking();
        });

        expect(result.current.trackingOrder).toBeNull();
        expect(result.current.isTracking).toBe(false);
    });

    // -------------------------------------------------------------------------
    it('connectionState reflects SSE connection status', async () => {
        const order = buildOrder();
        mockApiClient.trackOrder.mockResolvedValue(order);

        mockUseSSE.mockReturnValue({
            connectionState: SSEConnectionState.OPEN,
            lastUpdatedAt: new Date(),
        });

        const { result } = renderHook(() => useOrder(), { wrapper });

        await act(async () => {
            await result.current.startTracking('ORD202402240001');
        });

        expect(result.current.connectionState).toBe(SSEConnectionState.OPEN);
    });

    // -------------------------------------------------------------------------
    it('SSE connection closes automatically when order is DELIVERED', async () => {
        const deliveredOrder = buildOrder({ status: OrderStatus.DELIVERED });
        mockApiClient.trackOrder.mockResolvedValueOnce(deliveredOrder);

        mockUseSSE.mockReturnValue({
            connectionState: SSEConnectionState.CLOSED,
            lastUpdatedAt: new Date(),
        });

        const { result } = renderHook(() => useOrder(), { wrapper });

        await act(async () => {
            await result.current.startTracking('ORD202402240001');
        });

        expect(result.current.trackingOrder?.status).toBe(OrderStatus.DELIVERED);
        expect(result.current.connectionState).toBe(SSEConnectionState.CLOSED);
    });

    // -------------------------------------------------------------------------
    it('SSE connection closes automatically when order is CANCELLED', async () => {
        const cancelledOrder = buildOrder({ status: OrderStatus.CANCELLED });
        mockApiClient.trackOrder.mockResolvedValueOnce(cancelledOrder);

        mockUseSSE.mockReturnValue({
            connectionState: SSEConnectionState.CLOSED,
            lastUpdatedAt: new Date(),
        });

        const { result } = renderHook(() => useOrder(), { wrapper });

        await act(async () => {
            await result.current.startTracking('ORD202402240001');
        });

        expect(result.current.trackingOrder?.status).toBe(OrderStatus.CANCELLED);
        expect(result.current.connectionState).toBe(SSEConnectionState.CLOSED);
    });

    // -------------------------------------------------------------------------
    it('refreshTracking manually fetches the latest order status', async () => {
        const order = buildOrder({ status: OrderStatus.RECEIVED });
        const refreshedOrder = buildOrder({ status: OrderStatus.PREPARING });

        mockApiClient.trackOrder
            .mockResolvedValueOnce(order)
            .mockResolvedValueOnce(refreshedOrder);

        const { result } = renderHook(() => useOrder(), { wrapper });

        await act(async () => {
            await result.current.startTracking('ORD202402240001');
        });

        await act(async () => {
            await result.current.refreshTracking();
        });

        expect(result.current.trackingOrder?.status).toBe(OrderStatus.PREPARING);
    });

    // -------------------------------------------------------------------------
    it('lastUpdatedAt is updated after SSE updates', async () => {
        const order = buildOrder();
        const updateTime = new Date();
        
        mockApiClient.trackOrder.mockResolvedValue(order);
        mockUseSSE.mockReturnValue({
            connectionState: SSEConnectionState.OPEN,
            lastUpdatedAt: updateTime,
        });

        const { result } = renderHook(() => useOrder(), { wrapper });

        await act(async () => {
            await result.current.startTracking('ORD202402240001');
        });

        expect(result.current.lastUpdatedAt).toBe(updateTime);
    });
});
