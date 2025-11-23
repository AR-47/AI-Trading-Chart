import React from 'react';
import './SkeletonLoader.css';

export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => (
    <div 
        className={`skeleton-box ${className}`}
        style={{ width, height, borderRadius }}
    />
);

export const SkeletonCircle = ({ size = '40px', className = '' }) => (
    <div 
        className={`skeleton-box ${className}`}
        style={{ width: size, height: size, borderRadius: '50%' }}
    />
);

export const SkeletonText = ({ lines = 1, gap = '8px' }) => (
    <div className="skeleton-text" style={{ gap }}>
        {Array.from({ length: lines }).map((_, index) => (
            <SkeletonBox 
                key={index} 
                height="16px" 
                width={index === lines - 1 && lines > 1 ? '70%' : '100%'}
            />
        ))}
    </div>
);

export const PredictionPanelSkeleton = () => (
    <div className="prediction-panel-skeleton">
        {/* Header Skeleton */}
        <div className="skeleton-header">
            <div className="skeleton-header-left">
                <SkeletonCircle size="18px" />
                <SkeletonBox width="120px" height="18px" />
            </div>
            <SkeletonBox width="60px" height="24px" borderRadius="12px" />
        </div>

        {/* Symbol Selector Skeleton */}
        <div className="skeleton-selector">
            <SkeletonCircle size="14px" />
            <SkeletonBox width="100%" height="36px" borderRadius="6px" />
        </div>

        {/* Timeframe Selector Skeleton */}
        <div className="skeleton-selector">
            <SkeletonCircle size="14px" />
            <SkeletonBox width="100%" height="36px" borderRadius="6px" />
        </div>

        {/* Current Price Skeleton */}
        <div className="skeleton-price-section">
            <SkeletonBox width="80px" height="12px" />
            <SkeletonBox width="180px" height="32px" />
        </div>

        {/* Predicted Price Skeleton */}
        <div className="skeleton-price-section">
            <SkeletonBox width="120px" height="12px" />
            <SkeletonBox width="200px" height="32px" />
            <div className="skeleton-change">
                <SkeletonCircle size="16px" />
                <SkeletonBox width="100px" height="16px" />
            </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="skeleton-metrics">
            {[1, 2, 3].map((item) => (
                <div key={item} className="skeleton-metric">
                    <SkeletonBox width="80px" height="12px" />
                    <SkeletonBox width="100%" height="20px" />
                </div>
            ))}
        </div>

        {/* Sentiment Section Skeleton */}
        <div className="skeleton-section">
            <div className="skeleton-section-header">
                <SkeletonCircle size="14px" />
                <SkeletonBox width="120px" height="14px" />
            </div>
            <div className="skeleton-sentiment-box">
                <SkeletonBox width="60px" height="16px" />
                <SkeletonBox width="100%" height="6px" borderRadius="3px" />
            </div>
        </div>

        {/* Drivers Section Skeleton */}
        <div className="skeleton-section">
            <div className="skeleton-section-header">
                <SkeletonCircle size="14px" />
                <SkeletonBox width="100px" height="14px" />
            </div>
            <div className="skeleton-drivers">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="skeleton-driver-item">
                        <SkeletonBox width="80px" height="14px" />
                        <SkeletonBox width="60px" height="14px" />
                    </div>
                ))}
            </div>
        </div>

        {/* Analysis Note Skeleton */}
        <div className="skeleton-note">
            <SkeletonCircle size="14px" />
            <SkeletonText lines={2} />
        </div>
    </div>
);

export default SkeletonBox;
